module <your_address>::marketplace {

    use sui::object::{Self, ID, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use std::option::{Self, Option};
    use std::string::String;
    use std::vector;
    use std::balance::{Self, Balance};
    use sui::coin::{Self, Coin};

    use <your_address>::rwa_asset::{RWAAssetNFT, RWAAssetFT, AssetType};
    use <your_address>::admin::{AdminCap};
    use <your_address>::issuer_registry::{IssuerCap};

    /// Enum to distinguish asset listing types
    public enum ListingType {
        NFT,
        FT
    }

    /// Listing for an NFT-like asset
    struct NFTListing has key {
        id: UID,
        asset_id: ID,
        seller: address,
        price: u64,
        asset_type: AssetType,
    }

    /// Listing for a fungible token-based asset
    struct FTListing has key {
        id: UID,
        asset_id: ID,
        seller: address,
        amount: u64,
        price_per_unit: u64,
        asset_type: AssetType,
    }

    /// Marketplace state (for pause control, can be expanded)
    struct MarketplaceState has key {
        id: UID,
        paused: bool,
    }

    /// Initialize marketplace state
    public fun init_marketplace(ctx: &mut TxContext): MarketplaceState {
        MarketplaceState {
            id: object::new(ctx),
            paused: false,
        }
    }

    /// Admin: Pause the marketplace
    public fun pause_marketplace(admin: &AdminCap, state: &mut MarketplaceState) {
        state.paused = true;
    }

    /// Admin: Unpause the marketplace
    public fun unpause_marketplace(admin: &AdminCap, state: &mut MarketplaceState) {
        state.paused = false;
    }

    /// List a unique NFT asset for sale
    public entry fun list_asset_nft(
        state: &MarketplaceState,
        nft: RWAAssetNFT,
        price: u64,
        ctx: &mut TxContext
    ): NFTListing {
        assert!(!state.paused, 0);
        let seller = tx_context::sender(ctx);
        assert!(nft.issuer == seller, 1); // Only issuer can list their asset

        NFTListing {
            id: object::new(ctx),
            asset_id: nft.id,
            seller,
            price,
            asset_type: nft.asset_type,
        }
    }

    /// List a portion of a fungible asset
    public entry fun list_asset_ft(
        state: &MarketplaceState,
        asset: &mut RWAAssetFT,
        amount: u64,
        price_per_unit: u64,
        ctx: &mut TxContext
    ): FTListing {
        assert!(!state.paused, 0);
        let seller = tx_context::sender(ctx);
        assert!(asset.issuer == seller, 1);
        assert!(amount > 0 && amount <= asset.total_supply, 2);

        asset.total_supply = asset.total_supply - amount;

        FTListing {
            id: object::new(ctx),
            asset_id: asset.id,
            seller,
            amount,
            price_per_unit,
            asset_type: asset.asset_type,
        }
    }

    /// Buy an NFT asset
    public entry fun buy_asset_nft(
        state: &MarketplaceState,
        listing: NFTListing,
        payment: Coin,
        ctx: &mut TxContext
    ): RWAAssetNFT {
        assert!(!state.paused, 0);
        let buyer = tx_context::sender(ctx);
        let price = listing.price;
        assert!(coin::value(&payment) >= price, 1);

        let change = coin::split(&mut payment, coin::value(&payment) - price);
        transfer::transfer(change, buyer); // return change if overpaid
        transfer::transfer(payment, listing.seller); // send payment

        // Normally you'd load the RWAAssetNFT from storage, simulate here
        // In real implementation, NFTs must be passed in or loaded via dynamic field
        // We assume NFT transfer happens externally for simplicity

        let asset = RWAAssetNFT {
            id: listing.asset_id,
            issuer: listing.seller,
            metadata_uri: string::utf8(b""),
            asset_type: listing.asset_type,
            valuation: price,
            maturity: option::none(),
            apy: option::none()
        };

        transfer::transfer(asset, buyer);
        object::delete(listing);
        asset
    }

    /// Buy from a fungible token listing
    public entry fun buy_asset_ft(
        state: &MarketplaceState,
        listing: &mut FTListing,
        payment: Coin,
        ctx: &mut TxContext
    ): u64 {
        assert!(!state.paused, 0);
        let buyer = tx_context::sender(ctx);

        let value = coin::value(&payment);
        let units = value / listing.price_per_unit;
        assert!(units > 0 && units <= listing.amount, 1);

        let total_cost = units * listing.price_per_unit;
        let refund = value - total_cost;

        listing.amount = listing.amount - units;
        transfer::transfer(payment, listing.seller);

        if (refund > 0) {
            let change = coin::split(&mut payment, refund);
            transfer::transfer(change, buyer);
        };

        if (listing.amount == 0) {
            object::delete(listing);
        };

        // In a real impl, you'd mint or transfer FT units to buyer
        units
    }

    /// Cancel NFT listing
    public entry fun cancel_nft_listing(
        listing: NFTListing,
        ctx: &mut TxContext
    ): RWAAssetNFT {
        let sender = tx_context::sender(ctx);
        assert!(sender == listing.seller, 0);

        let asset = RWAAssetNFT {
            id: listing.asset_id,
            issuer: listing.seller,
            metadata_uri: string::utf8(b""),
            asset_type: listing.asset_type,
            valuation: listing.price,
            maturity: option::none(),
            apy: option::none()
        };

        object::delete(listing);
        asset
    }

    /// Cancel FT listing
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
