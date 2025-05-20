module 0xYourAddr::marketplace {
    use sui::object::{Self, ID, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::balance;
    use sui::coin::{Self, Coin};
    use std::option::{Self, Option};
    use std::string::{Self, String};
    use std::vec;
    use std::error;

    use 0xYourAddr::rwa_asset::{Self, RWAAssetNFT, RWAAssetFT, AssetType};
    use 0xYourAddr::issuer_registry::{Self, IssuerCap};
    use 0xYourAddr::admin::{Self, AdminCap};

    /// Enum to distinguish listing types
    public enum ListingType {
        NFT,
        FT,
    }

    /// Marketplace state for admin control
    struct MarketplaceState has key {
        id: UID,
        paused: bool,
    }

    /// NFT Listing structure
    struct NFTListing has key {
        id: UID,
        asset_id: ID,
        nft: RWAAssetNFT,
        seller: address,
        price: u64,
    }

    /// FT Listing structure
    struct FTListing has key {
        id: UID,
        asset_id: ID,
        seller: address,
        amount: u64,
        price_per_unit: u64,
        asset_type: AssetType,
    }

    /// --- Admin Functions ---

    public fun init_marketplace(ctx: &mut TxContext): MarketplaceState {
        MarketplaceState {
            id: object::new(ctx),
            paused: false,
        }
    }

    public fun pause_marketplace(admin: &AdminCap, state: &mut MarketplaceState) {
        state.paused = true;
    }

    public fun unpause_marketplace(admin: &AdminCap, state: &mut MarketplaceState) {
        state.paused = false;
    }

    /// --- Listing Functions ---

    /// List a RWA NFT asset (issuer must be seller)
    public entry fun list_asset_nft(
        state: &MarketplaceState,
        nft: RWAAssetNFT,
        price: u64,
        ctx: &mut TxContext
    ): NFTListing {
        assert!(!state.paused, error::invalid_state(0));
        let sender = tx_context::sender(ctx);
        assert!(nft.issuer == sender, error::permission_denied(1));

        NFTListing {
            id: object::new(ctx),
            asset_id: nft.id,
            nft,
            seller: sender,
            price
        }
    }

    /// List a fungible token asset
    public entry fun list_asset_ft(
        state: &MarketplaceState,
        mut asset: RWAAssetFT,
        amount: u64,
        price_per_unit: u64,
        ctx: &mut TxContext
    ): (FTListing, RWAAssetFT) {
        assert!(!state.paused, error::invalid_state(0));
        let sender = tx_context::sender(ctx);
        assert!(asset.issuer == sender, error::permission_denied(1));
        assert!(amount > 0 && amount <= asset.total_supply, error::invalid_argument(2));

        asset.total_supply = asset.total_supply - amount;

        let listing = FTListing {
            id: object::new(ctx),
            asset_id: asset.id,
            seller: sender,
            amount,
            price_per_unit,
            asset_type: asset.asset_type,
        };

        (listing, asset)
    }

    /// --- Buy Functions ---

    /// Buy a listed NFT
    public entry fun buy_asset_nft(
        state: &MarketplaceState,
        listing: NFTListing,
        mut payment: Coin,
        ctx: &mut TxContext
    ): RWAAssetNFT {
        assert!(!state.paused, error::invalid_state(0));
        let buyer = tx_context::sender(ctx);
        let price = listing.price;
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= price, error::insufficient_balance(1));

        let refund_amount = payment_amount - price;

        if (refund_amount > 0) {
            let refund = coin::split(&mut payment, refund_amount);
            transfer::transfer(refund, buyer);
        };

        transfer::transfer(payment, listing.seller);
        let nft = listing.nft;
        transfer::transfer(nft, buyer);
        object::delete(listing);
        nft
    }

    /// Buy a listed FT
    public entry fun buy_asset_ft(
        state: &MarketplaceState,
        listing: &mut FTListing,
        mut payment: Coin,
        ctx: &mut TxContext
    ): RWAAssetFT {
        assert!(!state.paused, error::invalid_state(0));
        let buyer = tx_context::sender(ctx);
        let value = coin::value(&payment);
        let units = value / listing.price_per_unit;
        assert!(units > 0 && units <= listing.amount, error::invalid_argument(1));

        let total_price = units * listing.price_per_unit;
        let refund = value - total_price;

        listing.amount = listing.amount - units;
        transfer::transfer(payment, listing.seller);

        if (refund > 0) {
            let change = coin::split(&mut payment, refund);
            transfer::transfer(change, buyer);
        };

        if (listing.amount == 0) {
            object::delete(listing);
        };

        // Mint a new FT token for the buyer to simulate partial ownership
        RWAAssetFT {
            id: object::new(ctx),
            issuer: listing.seller,
            metadata_uri: string::utf8(b""), // Optionally store original FT metadata
            asset_type: listing.asset_type,
            total_supply: units,
        }
    }

    /// --- Cancel Listing Functions ---

    /// Cancel an NFT listing
    public entry fun cancel_nft_listing(
        listing: NFTListing,
        ctx: &mut TxContext
    ): RWAAssetNFT {
        let sender = tx_context::sender(ctx);
        assert!(sender == listing.seller, error::permission_denied(0));
        let nft = listing.nft;
        object::delete(listing);
        nft
    }

    /// Cancel a FT listing
    public entry fun cancel_ft_listing(
        listing: &mut FTListing,
        mut asset: RWAAssetFT,
        ctx: &mut TxContext
    ): RWAAssetFT {
        let sender = tx_context::sender(ctx);
        assert!(sender == listing.seller, error::permission_denied(0));
        asset.total_supply = asset.total_supply + listing.amount;
        listing.amount = 0;
        object::delete(listing);
        asset
    }
}
