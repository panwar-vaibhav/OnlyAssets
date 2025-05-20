module your_address::issuer_registry {

    use std::vector;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use sui::address::Address;

    /// Public struct to be accessed by other modules
    public struct IssuerRegistry has key {
        id: UID,
        admin: address,
        issuers: vector<IssuerInfo>,
    }

    /// Public struct used by rwa_asset module for access control
    public struct IssuerCap has key {
        issuer: address,
    }

    /// Issuer metadata
    public struct IssuerInfo has copy, drop, store {
        issuer: address,
        name: vector<u8>,
        metadata_uri: vector<u8>, // IPFS/HTTP URI with legal + KYC details
        active: bool,
    }

    /// Create the issuer registry (only once)
    public fun init_registry(ctx: &mut TxContext): IssuerRegistry {
        IssuerRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            issuers: vector::empty<IssuerInfo>(),
        }
    }

    /// Admin-only: Add new verified issuer
    public fun add_issuer(
        registry: &mut IssuerRegistry,
        issuer: address,
        name: vector<u8>,
        metadata_uri: vector<u8>,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, 0);
        let info = IssuerInfo {
            issuer,
            name,
            metadata_uri,
            active: true,
        };
        vector::push_back(&mut registry.issuers, info);
    }

    /// Admin-only: Deactivate an issuer
    public fun deactivate_issuer(
        registry: &mut IssuerRegistry,
        issuer: address,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, 1);
        let len = vector::length(&registry.issuers);
        let mut i = 0;
        while (i < len) {
            let info = &mut vector::borrow_mut(&mut registry.issuers, i);
            if (info.issuer == issuer) {
                info.active = false;
                return;
            };
            i = i + 1;
        };
    }

    /// Public: check if address is active issuer
    public fun is_valid_issuer(
        registry: &IssuerRegistry,
        addr: address
    ): bool {
        let len = vector::length(&registry.issuers);
        let mut i = 0;
        while (i < len) {
            let info = &vector::borrow(&registry.issuers, i);
            if (info.issuer == addr && info.active) {
                return true;
            };
            i = i
