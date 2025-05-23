/*
/// Module: marketplace
module marketplace::marketplace;
*/
module marketplace::marketplace {
    use sui::table::{Self, Table};
    use sui::object::{Self, ID};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::tx_context::{Self, TxContext};
    use sui::balance;
    use sui::error;
    use sui::option::{Self, Option};
    use sui::timestamp;

    use rwa::rwa_asset::{Self as RWAAsset, RWAAssetNFT, RWAAssetFT, transfer_asset_nft, transfer_asset_ft, withdraw_ft};
    use rwa::issuer_registry::{Self as IssuerRegistry};
    use rwa::admin::{Self as Admin, AdminCap};

    const E_NOT_AUTHORIZED: u64 = 0;
    const E_NOT_FOUND: u64 = 1;
    const E_LISTING_EXISTS: u64 = 2;
    const E_NOT_SELLER: u64 = 3;
    const E_PAUSED: u64 = 4;
    const E_INVALID_PAYMENT: u64 = 5;

    /// Main Marketplace object
    struct Marketplace has key {
        id: ID,
        listings: Table<ID, MarketplaceListing>,
        ft_escrow: Table<ID, Coin<SUI>>,
        nft_escrow: Table<ID, RWAAssetNFT>,
        paused: bool
    }

    /// A single asset listing
    struct MarketplaceListing has copy, drop, store {
        id: ID,
        asset_id: ID,
        is_nft: bool,
        seller: address,
        price: u64,
        timestamp: u64
    }

    public fun init(ctx: &mut TxContext): Marketplace {
        Marketplace {
            id: object::new(ctx),
            listings: table::new(ctx),
            ft_escrow: table::new(ctx),
            nft_escrow: table::new(ctx),
            paused: false
        }
    }

    public fun pause(admin: &AdminCap, marketplace: &mut Marketplace) {
        Admin::assert_admin(admin);
        marketplace.paused = true;
    }

    public fun unpause(admin: &AdminCap, marketplace: &mut Marketplace) {
        Admin::assert_admin(admin);
        marketplace.paused = false;
    }

    public fun list_asset_nft(
        marketplace: &mut Marketplace,
        issuer_registry: &IssuerRegistry,
        nft: RWAAssetNFT,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(!marketplace.paused, E_PAUSED);
        assert!(IssuerRegistry::is_issuer(issuer_registry, &nft.issuer), E_NOT_AUTHORIZED);

        let id = object::new(ctx);
        let ts = timestamp::now_ms();
        let listing = MarketplaceListing {
            id,
            asset_id: nft.id,
            is_nft: true,
            seller: nft.issuer,
            price,
            timestamp: ts
        };

        // Escrow NFT in contract custody
        table::add(&mut marketplace.nft_escrow, nft.id, nft);
        table::add(&mut marketplace.listings, id, listing);
    }

    public fun list_asset_ft(
        marketplace: &mut Marketplace,
        issuer_registry: &IssuerRegistry,
        ft: &mut RWAAssetFT,
        amount: u64,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(!marketplace.paused, E_PAUSED);
        assert!(IssuerRegistry::is_issuer(issuer_registry, &ft.issuer), E_NOT_AUTHORIZED);

        let id = object::new(ctx);
        let ts = timestamp::now_ms();
        let coin = withdraw_ft(ft, amount, ctx);

        let listing = MarketplaceListing {
            id,
            asset_id: ft.id,
            is_nft: false,
            seller: ft.issuer,
            price,
            timestamp: ts
        };

        table::add(&mut marketplace.ft_escrow, id, coin);
        table::add(&mut marketplace.listings, id, listing);
    }

    public fun buy_asset(
        marketplace: &mut Marketplace,
        listing_id: ID,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(!marketplace.paused, E_PAUSED);
        let listing = table::remove(&mut marketplace.listings, listing_id);

        assert!(coin::value(&payment) >= listing.price, E_INVALID_PAYMENT);

        let protocol_fee = listing.price / 1000; // 0.1%
        let seller_share = listing.price - protocol_fee;
        let seller_coin = coin::split(&payment, seller_share);
        transfer::transfer(seller_coin, listing.seller);

        if listing.is_nft {
            let nft = table::remove(&mut marketplace.nft_escrow, listing.asset_id);
            transfer_asset_nft(nft, tx_context::sender(ctx));
        } else {
            let coin = table::remove(&mut marketplace.ft_escrow, listing_id);
            transfer_asset_ft(coin, tx_context::sender(ctx));
        }

        // Any remainder in payment goes back to sender
        transfer::public_transfer(payment, tx_context::sender(ctx));
    }

    public fun cancel_listing(
        marketplace: &mut Marketplace,
        listing_id: ID,
        ctx: &mut TxContext
    ) {
        let listing = table::remove(&mut marketplace.listings, listing_id);
        assert!(tx_context::sender(ctx) == listing.seller, E_NOT_SELLER);

        if listing.is_nft {
            let nft = table::remove(&mut marketplace.nft_escrow, listing.asset_id);
            transfer_asset_nft(nft, listing.seller);
        } else {
            let coin = table::remove(&mut marketplace.ft_escrow, listing_id);
            transfer::transfer(coin, listing.seller);
        }
    }
}
