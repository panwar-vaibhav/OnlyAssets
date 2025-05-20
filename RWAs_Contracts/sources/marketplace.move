module <your_address>::marketplace {

    use sui::object::{Self, ID, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use std::option::{Self, Option};
    use std::string::String;

    use <your_address>::rwa_asset::{Self, RWAAssetNFT, RWAAssetFT, AssetType};
    use <your_address>::issuer_registry::{Self, IssuerCap};
    use <your_address>::admin::{Self, AdminCap};

    /// Enum to distinguish listing type
    public enum ListingType {
        NFT,
        FT
    }

    /// NFT Listing
    struct NFTListing has key {
        id: UID,
        seller: address,
        price: u64,
        asset_type: AssetType,
        nft: RWAAssetNFT,
    }

    /// FT Listing
    struct FTListing has key {
        id: UID,
        seller: address,
        price_per_unit: u64,
        amount: u64,
        asset_type: AssetType,
        ft: RWAAssetFT,
    }

    /// Marketplace state (e.g. paused or not)
    struct MarketplaceState has key {
        id: UID,
        paused: bool,
    }

    /// Initialize the marketplace state object
    public fun init_marketplace(ctx: &mut TxContext): MarketplaceState {
        MarketplaceState {
            id: object::new(ctx),
            paused: false,
        }
    }

    /// Admin pauses the marketplace
    public fun pause_marketplace(_admin: &AdminCap, state: &mut MarketplaceState) {
        state.paused = true;
    }

    /// Admin unpauses the marketplace
    public fun unpause_marketplace(_admin: &AdminCap, state: &mut MarketplaceState) {
        state.paused = false;
    }

    /// List an NFT asset by issuer
    public entry fun list_asset_nft(
        state: &MarketplaceState,
        nft: RWAAssetNFT,
        price: u64,
        ctx: &mut TxContext
    ): NFTListing {
        assert!(!state.paused, 0);
        let sender = tx_context::sender(ctx);
        assert!(nft.issuer == sender, 1); // Only the issuer can list
        NFTListing {
            id: object::new(ctx),
            seller: sender,
            price,
            asset_type: nft.asset_type,
            nft,
        }
    }

    /// List a portion of a fungible token asset
    public entry fun list_asset_ft(
        state: &MarketplaceState,
        mut ft: RWAAssetFT,
        amount: u64,
        price_per_unit: u64,
        ctx: &mut TxContext
    ): FTListing {
        assert!(!state.paused, 0);
        let sender = tx_context::sender(ctx);
        assert!(ft.issuer == sender, 1);
        assert!(amount > 0 && amount <= ft.total_supply, 2);

        ft.total_supply = ft.total_supply - amount;

        FTListing {
            id: object::new(ctx),
            seller: sender,
            price_per_unit,
            amount,
            asset_type: ft.asset_type,
            ft,
        }
    }

    /// Buy listed NFT
    public entry fun buy_asset_nft(
        state: &MarketplaceState,
        listing: NFTListing,
        mut payment: Coin,
        ctx: &mut TxContext
    ): RWAAssetNFT {
        assert!(!state.paused, 0);
        let buyer = tx_context::sender(ctx);
        let value = coin::value(&payment);
        assert!(value >= listing.price, 1);

        let change = value - listing.price;
        if (change > 0) {
            let refund = coin::split(&mut payment, change);
            transfer::transfer(refund, buyer);
        }

        transfer::transfer(payment, listing.seller);
        transfer::transfer(listing.nft, buyer);
        object::delete(listing);
    }

    /// Buy from FT listing (receives units and updates listing)
    public entry fun buy_asset_ft(
        state: &MarketplaceState,
        listing: &mut FTListing,
        mut payment: Coin,
        ctx: &mut TxContext
    ): u64 {
        assert!(!state.paused, 0);
        let buyer = tx_context::sender(ctx);

        let value = coin::value(&payment);
        let units = value / listing.price_per_unit;
        assert!(units > 0 && units <= listing.amount, 1);

        let total_price = units * listing.price_per_unit;
        let refund = value - total_price;

        listing.amount = listing.amount - units;
        transfer::transfer(payment, listing.seller);

        if (refund > 0) {
            let refund_coin = coin::split(&mut payment, refund);
            transfer::transfer(refund_coin, buyer);
        }

        if (listing.amount == 0) {
            object::delete(listing);
        }

        // In a real-world scenario, you'd mint or transfer units of FT to buyer
        units
    }

    /// Cancel NFT listing by seller
    public entry fun cancel_nft_listing(
        listing: NFTListing,
        ctx: &mut TxContext
    ): RWAAssetNFT {
        let sender = tx_context::sender(ctx);
        assert!(sender == listing.seller, 0);
        object::delete(listing);
        listing.nft
    }

    /// Cancel FT listing and return the tokens
    public entry fun cancel_ft_listing(
        listing: &mut FTListing,
        asset: &mut RWAAssetFT,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == listing.seller, 0);
        asset.total_supply = asset.total_supply + listing.amount;
        listing.amount = 0;
        object::delete(listing);
    }
}
