module rwa::marketplace {

    use sui::object::{Self, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::coin;
    use sui::balance;
    use sui::error;
    use sui::option;

    use rwa::rwa_asset::{RWAAssetNFT, RWAAssetFT, AssetType, transfer_asset_nft, transfer_asset_ft};
    use rwa::issuer_registry::{IssuerCap, is_issuer};
    use rwa::admin::{AdminCap, assert_not_paused};

    /// Struct for NFT or FT listings
    struct MarketplaceListing has key, store {
        id: ID,
        seller: address,
        price: u64,
        asset_type: AssetType,
        asset_id: ID,
        is_nft: bool,
        amount: option::Option<u64>, // only used for FT
    }

    /// NFT listing
    public fun list_asset_nft(
        issuer_cap: &IssuerCap,
        nft: RWAAssetNFT,
        price: u64,
        ctx: &mut TxContext
    ): (MarketplaceListing, RWAAssetNFT) {
        assert!(is_issuer(issuer_cap.owner), 100, "Not a whitelisted issuer");
        assert!(price > 0, 101);

        let id = object::new(ctx);

        let listing = MarketplaceListing {
            id,
            seller: issuer_cap.owner,
            price,
            asset_type: nft.asset_type,
            asset_id: nft.id,
            is_nft: true,
            amount: option::none<u64>(),
        };

        (listing, nft)
    }

    /// FT listing (escrows the FT amount)
    public fun list_asset_ft(
        issuer_cap: &IssuerCap,
        ft: &mut RWAAssetFT,
        amount: u64,
        price: u64,
        ctx: &mut TxContext
    ): (MarketplaceListing, RWAAssetFT) {
        assert!(is_issuer(issuer_cap.owner), 200, "Not a whitelisted issuer");
        assert!(price > 0 && amount > 0, 201);

        let esc_ft = rwa::rwa_asset::withdraw_ft(ft, amount);

        let id = object::new(ctx);

        let listing = MarketplaceListing {
            id,
            seller: issuer_cap.owner,
            price,
            asset_type: ft.asset_type,
            asset_id: ft.id,
            is_nft: false,
            amount: option::some(amount),
        };

        (listing, esc_ft)
    }

    /// Buy NFT asset
    public fun buy_asset_nft(
        listing: MarketplaceListing,
        nft: RWAAssetNFT,
        payment: coin::Coin,
        admin: &AdminCap,
        ctx: &mut TxContext
    ) : RWAAssetNFT {
        assert!(!admin.paused, 300, "Marketplace paused");
        assert!(listing.is_nft, 301);

        let price = listing.price;
        assert!(coin::value(&payment) >= price, 302);

        let seller_share = price; // Protocol fee logic can go here
        let _ = coin::split(&payment, seller_share);
        transfer::transfer(payment, listing.seller);

        transfer_asset_nft(nft, ctx)
    }

    /// Buy FT asset
    public fun buy_asset_ft(
        listing: MarketplaceListing,
        ft: RWAAssetFT,
        payment: coin::Coin,
        admin: &AdminCap,
        ctx: &mut TxContext
    ): RWAAssetFT {
        assert!(!admin.paused, 400, "Marketplace paused");
        assert!(!listing.is_nft, 401);

        let price = listing.price;
        let amount = option::extract(listing.amount);
        assert!(coin::value(&payment) >= price, 402);

        let seller_share = price;
        let _ = coin::split(&payment, seller_share);
        transfer::transfer(payment, listing.seller);

        transfer_asset_ft(ft, amount, ctx)
    }

    /// Cancel any listing (only seller)
    public fun cancel_listing(
        listing: MarketplaceListing,
        caller: address
    ) {
        assert!(listing.seller == caller, 500, "Only seller can cancel");
        // NFT or FT returned manually by front-end custody management
        object::delete(listing);
    }
} 
