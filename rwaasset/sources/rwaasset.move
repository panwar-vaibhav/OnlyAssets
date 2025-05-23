module rwaasset::rwaasset {
    use std::string;
    use issuerregistry::issuer_registry::{IssuerCap, IssuerRegistry, is_valid_issuer};

    public enum AssetType has store {
        RealEstate,
        Invoice,
        Gold,
        Stocks,
        CarbonCredit,
        Custom
    }

    public struct RWAAssetNFT has key, store {
        id: UID,
        issuer: address,
        metadata_uri: string::String,
        asset_type: AssetType,
        valuation: u64,
        maturity: option::Option<u64>,
        apy: option::Option<u64>,
    }

    public struct RWAAssetFT has key, store {
        id: UID,
        issuer: address,
        metadata_uri: string::String,
        asset_type: AssetType,
        total_supply: u64,
    }

    public entry fun mint_asset_nft(
        cap: &IssuerCap,
        metadata_uri: string::String,
        asset_type: AssetType,
        valuation: u64,
        maturity: option::Option<u64>,
        apy: option::Option<u64>,
        registry: &IssuerRegistry,
        ctx: &mut TxContext
    ) {
        assert!(is_valid_issuer(registry, cap.issuer), 0);

        let nft = RWAAssetNFT {
            id: object::new(ctx),
            issuer: cap.issuer,
            metadata_uri,
            asset_type,
            valuation,
            maturity,
            apy
        };
        transfer::transfer(nft, cap.issuer);
    }

    public entry fun mint_asset_ft(
        cap: &IssuerCap,
        metadata_uri: string::String,
        asset_type: AssetType,
        total_supply: u64,
        registry: &IssuerRegistry,
        ctx: &mut TxContext
    ) {
        assert!(total_supply > 0, 1);
        assert!(is_valid_issuer(registry, cap.issuer), 0);

        let ft = RWAAssetFT {
            id: object::new(ctx),
            issuer: cap.issuer,
            metadata_uri,
            asset_type,
            total_supply
        };
        transfer::transfer(ft, cap.issuer);
    }

}
