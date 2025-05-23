module marketplace::marketplace {
    use sui::table::{Self, Table};
    use sui::coin::{Self, Coin};
    use sui::timestamp;
    use rwaasset::rwaasset::{RWAAssetNFT, RWAAssetFT, transfer_asset_nft, transfer_asset_ft, withdraw_ft};
    use issuerregistry::issuer_registry::{IssuerRegistry, is_issuer};
    use admin::admin::{AdminCap, assert_admin};

    const E_NOT_AUTHORIZED: u64 = 0;
    const E_NOT_FOUND: u64 = 1;
    const E_LISTING_EXISTS: u64 = 2;
    const E_NOT_SELLER: u64 = 3;
    const E_PAUSED: u64 = 4;
    const E_INVALID_PAYMENT: u64 = 5;

    /// Main Marketplace object
    public struct Marketplace has key {
        id: UID,
        listings: Table<ID, MarketplaceListing>,
        ft_escrow: Table<ID, Coin<SUI>>,
        nft_escrow: Table<ID, RWAAssetNFT>,
        paused: bool
    }

    /// A single asset listing
    public struct MarketplaceListing has copy, drop, store {
        id: ID,
        asset_id: ID,
        is_nft: bool,
        seller: address,
        price: u64,
        timestamp: u64
    }

    /// Initialize a new marketplace
    public entry fun init(ctx: &mut TxContext): Marketplace {
        Marketplace {
            id: object::new(ctx),
            listings: table::new(ctx),
            ft_escrow: table::new(ctx),
            nft_escrow: table::new(ctx),
            paused: false
        }
    }

    /// Pause the marketplace (admin only)
    public entry fun pause(admin: &AdminCap, marketplace: &mut Marketplace) {
        assert_admin(admin);
        marketplace.paused = true;
    }

    /// Unpause the marketplace (admin only)
    public entry fun unpause(admin: &AdminCap, marketplace: &mut Marketplace) {
        assert_admin(admin);
        marketplace.paused = false;
    }

    /// List an NFT asset
    public entry fun list_asset_nft(
        marketplace: &mut Marketplace,
        issuer_registry: &IssuerRegistry,
        nft: RWAAssetNFT,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(!marketplace.paused, E_PAUSED);
        assert!(is_issuer(issuer_registry, &nft.issuer), E_NOT_AUTHORIZED);

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

        table::add(&mut marketplace.nft_escrow, nft.id, nft);
        table::add(&mut marketplace.listings, id, listing);
    }

    /// List a fungible asset
    public entry fun list_asset_ft(
        marketplace: &mut Marketplace,
        issuer_registry: &IssuerRegistry,
        ft: &mut RWAAssetFT,
        amount: u64,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(!marketplace.paused, E_PAUSED);
        assert!(is_issuer(issuer_registry, &ft.issuer), E_NOT_AUTHORIZED);

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

    /// Buy an asset (NFT or FT)
    public entry fun buy_asset(
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
        transfer::public_transfer(seller_coin, listing.seller);

        // TODO: Send protocol_fee to a treasury address if desired

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

    /// Cancel a listing (seller only)
    public entry fun cancel_listing(
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
            transfer::public_transfer(coin, listing.seller);
        }
    }
}
