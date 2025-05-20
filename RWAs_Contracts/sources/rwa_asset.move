module rwa_asset {

    use std::string;
    use sui::object::{Self, ID};
    use sui::tx_context::TxContext;
    use sui::option;
    use 0xYourAddr::issuer_registry::{self, IssuerCap};

    /// Enum to distinguish asset categories
    public enum AssetType {
        RealEstate,
        Invoice,
        Gold,
        Stocks,
        CarbonCredit,
        Custom
    }

    /// Unique NFT-based asset structure
    public struct RWAAssetNFT has key, store {
        id: ID,
        issuer: address,
        metadata_uri: string::String,
        asset_type: AssetType,
        valuation: u64,
        maturity: option::Option<u64>,
        apy: option::Option<u64>,
    }

    /// Fungible token-based asset structure
    public struct RWAAssetFT has key, store {
        id: ID,
        issuer: address,
        metadata_uri: string::String,
        asset_type: AssetType,
        total_supply: u64,
    }

    /// Mint a unique NFT-like asset
    public entry fun mint_asset_nft(
        cap: &IssuerCap,
        metadata_uri: string::String,
        asset_type: AssetType,
        valuation: u64,
        maturity: option::Option<u64>,
        apy: option::Option<u64>,
        registry: &issuer_registry::IssuerRegistry,
        ctx: &mut TxContext
    ): RWAAssetNFT {
        assert!(issuer_registry::is_valid_issuer(registry, cap.issuer), 0);

        RWAAssetNFT {
            id: object::new(ctx),
            issuer: cap.issuer,
            metadata_uri,
            asset_type,
            valuation,
            maturity,
            apy
        }
    }

    /// Mint a fungible token-based asset
    public entry fun mint_asset_ft(
        cap: &IssuerCap,
        metadata_uri: string::String,
        asset_type: AssetType,
        total_supply: u64,
        registry: &issuer_registry::IssuerRegistry,
        ctx: &mut TxContext
    ): RWAAssetFT {
        assert!(total_supply > 0, 1);
        assert!(issuer_registry::is_valid_issuer(registry, cap.issuer), 0);

        RWAAssetFT {
            id: object::new(ctx),
            issuer: cap.issuer,
            metadata_uri,
            asset_type,
            total_supply
        }
    }

    /// Optional: Burn NFT
    public entry fun burn_asset_nft(nft: RWAAssetNFT, _ctx: &mut TxContext) {
        object::delete(nft);
    }

    /// Optional: Burn FT
    public entry fun burn_asset_ft(ft: RWAAssetFT, _ctx: &mut TxContext) {
        object::delete(ft);
    }
}
