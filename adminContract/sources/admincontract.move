address '0x0' {
    
    module adminContract::admin {
    use sui::object::{Self, UID, ID, new};
    use sui::tx_context::{Self, TxContext, sender};
    use sui::transfer;
    use sui::option::{Self, Option};
    use sui::table::{Self, Table};

    use rwa::issuer_registry::{Self, IssuerRegistry, init_registry};
    use rwa::marketplace::{Self, FungibleBalanceBook, init_balance_book};

    const E_NOT_ADMIN: u64 = 0;
    const E_ALREADY_PAUSED: u64 = 1;
    const E_ALREADY_ACTIVE: u64 = 2;

    /// Capability object to restrict sensitive actions
    struct AdminCap has key {
        id: UID,
        admin: address,
    }

    /// Platform-wide configuration and control state
    struct PlatformState has key {
        id: UID,
        registry: IssuerRegistry,
        balance_book: FungibleBalanceBook,
        paused: bool,
    }

    /// Bootstrap the protocol: only called once during deployment
    public entry fun init_platform(ctx: &mut TxContext): (AdminCap, PlatformState) {
        let admin_addr = sender(ctx);
        let admin_cap = AdminCap {
            id: new(ctx),
            admin: admin_addr,
        };

        let registry = init_registry(ctx);
        let balance_book = init_balance_book(ctx);

        let state = PlatformState {
            id: new(ctx),
            registry,
            balance_book,
            paused: false,
        };

        (admin_cap, state)
    }

    /// Pause marketplace + minting operations (emergency switch)
    public entry fun pause_platform(cap: &AdminCap, state: &mut PlatformState) {
        assert!(is_admin(cap), E_NOT_ADMIN);
        assert!(!state.paused, E_ALREADY_PAUSED);
        state.paused = true;
    }

    /// Resume all operations
    public entry fun unpause_platform(cap: &AdminCap, state: &mut PlatformState) {
        assert!(is_admin(cap), E_NOT_ADMIN);
        assert!(state.paused, E_ALREADY_ACTIVE);
        state.paused = false;
    }

    /// Returns if platform is paused (public view)
    public fun is_paused(state: &PlatformState): bool {
        state.paused
    }

    /// Replace issuer registry (e.g., if upgrade needed)
    public entry fun replace_registry(cap: &AdminCap, state: &mut PlatformState, new_registry: IssuerRegistry) {
        assert!(is_admin(cap), E_NOT_ADMIN);
        state.registry = new_registry;
    }

    /// Replace balance book (e.g., if upgrade or logic refactor)
    public entry fun replace_balance_book(cap: &AdminCap, state: &mut PlatformState, new_book: FungibleBalanceBook) {
        assert!(is_admin(cap), E_NOT_ADMIN);
        state.balance_book = new_book;
    }

    /// View accessors for registry and balance book
    public fun get_registry(state: &PlatformState): &IssuerRegistry {
        &state.registry
    }

    public fun get_balance_book(state: &PlatformState): &FungibleBalanceBook {
        &state.balance_book
    }

    fun is_admin(cap: &AdminCap): bool {
        cap.admin == sender()
    }
}

}
