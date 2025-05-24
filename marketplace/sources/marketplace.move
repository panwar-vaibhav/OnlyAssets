module marketplace::marketplace {
    use sui::table::{Self, Table};
    use sui::coin::{Self, Coin};
    use sui::clock::{Clock};
    use sui::sui::SUI;
    use rwaasset::rwaasset::{RWAAssetNFT, RWAAssetFT, nft_issuer, ft_issuer};
    use issuerregistry::issuer_registry::{IssuerRegistry, is_valid_issuer};
    use admin::admin::{AdminCap, assert_admin};

    const E_NOT_AUTHORIZED: u64 = 0;
    const E_NOT_SELLER: u64 = 3;
    const E_PAUSED: u64 = 4;
    const E_INVALID_PAYMENT: u64 = 5;

    /// Main Marketplace object
    public struct Marketplace has key {
        id: UID,
        listings: Table<ID, MarketplaceListing>,
        ft_escrow: Table<ID, RWAAssetFT>,
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
    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            listings: table::new(ctx),
            ft_escrow: table::new(ctx),
            nft_escrow: table::new(ctx),
            paused: false
        };
        transfer::share_object(marketplace);
    }

    /// Pause the marketplace (admin only)
    public entry fun pause(admin: &AdminCap, marketplace: &mut Marketplace, ctx: &TxContext) {
        assert_admin(admin, ctx);
        marketplace.paused = true;
    }

    /// Unpause the marketplace (admin only)
    public entry fun unpause(admin: &AdminCap, marketplace: &mut Marketplace, ctx: &TxContext) {
        assert_admin(admin, ctx);
        marketplace.paused = false;
    }

    /// List an NFT asset
    public entry fun list_asset_nft(
        marketplace: &mut Marketplace,
        issuer_registry: &IssuerRegistry,
        nft: RWAAssetNFT,
        price: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!marketplace.paused, E_PAUSED);
        assert!(is_valid_issuer(issuer_registry, nft_issuer(&nft)), E_NOT_AUTHORIZED);

        let listing_id = object::new(ctx);
        let asset_id = object::id(&nft);
        let ts = sui::clock::timestamp_ms(clock);
        let listing = MarketplaceListing {
            id: object::uid_to_inner(&listing_id),
            asset_id,
            is_nft: true,
            seller: nft_issuer(&nft),
            price,
            timestamp: ts
        };

        table::add(&mut marketplace.nft_escrow, asset_id, nft);
        table::add(&mut marketplace.listings, object::uid_to_inner(&listing_id), listing);
        object::delete(listing_id);
    }

    /// List a fungible asset
    public entry fun list_asset_ft(
        marketplace: &mut Marketplace,
        issuer_registry: &IssuerRegistry,
        ft: RWAAssetFT,
        price: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!marketplace.paused, E_PAUSED);
        assert!(is_valid_issuer(issuer_registry, ft_issuer(&ft)), E_NOT_AUTHORIZED);

        let listing_id = object::new(ctx);
        let asset_id = object::id(&ft);
        let ts = sui::clock::timestamp_ms(clock);

        let listing = MarketplaceListing {
            id: object::uid_to_inner(&listing_id),
            asset_id,
            is_nft: false,
            seller: ft_issuer(&ft),
            price,
            timestamp: ts
        };

        table::add(&mut marketplace.ft_escrow, asset_id, ft);
        table::add(&mut marketplace.listings, object::uid_to_inner(&listing_id), listing);
        object::delete(listing_id);
    }

    /// Buy an asset (NFT or FT)
    public entry fun buy_asset(
        marketplace: &mut Marketplace,
        listing_id: ID,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(!marketplace.paused, E_PAUSED);
        let listing = table::remove(&mut marketplace.listings, listing_id);

        assert!(coin::value(&payment) >= listing.price, E_INVALID_PAYMENT);

        let protocol_fee = listing.price / 1000; // 0.1%
        let seller_share = listing.price - protocol_fee;
        let seller_coin = coin::split(&mut payment, seller_share, ctx);
        transfer::public_transfer(seller_coin, listing.seller);

        // TODO: Send protocol_fee to a treasury address if desired

        if (listing.is_nft) {
            let nft = table::remove(&mut marketplace.nft_escrow, listing.asset_id);
            transfer::public_transfer(nft, tx_context::sender(ctx));
        } else {
            let ft = table::remove(&mut marketplace.ft_escrow, listing.asset_id);
            transfer::public_transfer(ft, tx_context::sender(ctx));
        };

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

        if (listing.is_nft) {
            let nft = table::remove(&mut marketplace.nft_escrow, listing.asset_id);
            transfer::public_transfer(nft, listing.seller);
        } else {
            let ft = table::remove(&mut marketplace.ft_escrow, listing.asset_id);
            transfer::public_transfer(ft, listing.seller);
        };
    }
}
