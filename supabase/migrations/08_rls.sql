-- Row Level Security: enable on all public tables and define all policies.
-- Uses public.wallet_address() and public.is_admin() from 05_functions.sql.

-- ─── auth_nonces ─────────────────────────────────────────────────────────────
ALTER TABLE public.auth_nonces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servrole only access" ON public.auth_nonces
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ─── enclosure_rows ──────────────────────────────────────────────────────────
ALTER TABLE public.enclosure_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY enclosure_rows_public_read ON public.enclosure_rows
    FOR SELECT USING (true);

CREATE POLICY enclosure_rows_admin_manage ON public.enclosure_rows
    USING (public.is_admin());

-- ─── enclosures ──────────────────────────────────────────────────────────────
ALTER TABLE public.enclosures ENABLE ROW LEVEL SECURITY;

CREATE POLICY enclosures_public_read ON public.enclosures
    FOR SELECT USING (true);

CREATE POLICY enclosures_admin_manage ON public.enclosures
    USING (public.is_admin());

-- ─── event_pricing ───────────────────────────────────────────────────────────
ALTER TABLE public.event_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_pricing_public_read ON public.event_pricing
    FOR SELECT USING (true);

CREATE POLICY pricing_public_read ON public.event_pricing
    FOR SELECT USING (true);

CREATE POLICY pricing_admin_manage ON public.event_pricing
    USING (public.is_admin());

-- ─── events ──────────────────────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_public_read ON public.events
    FOR SELECT USING (true);

CREATE POLICY events_admin_manage ON public.events
    USING (public.is_admin());

-- ─── indexer_state ───────────────────────────────────────────────────────────
-- No policies: only service_role (bypasses RLS) can access.
ALTER TABLE public.indexer_state ENABLE ROW LEVEL SECURITY;

-- ─── seat_holds ──────────────────────────────────────────────────────────────
ALTER TABLE public.seat_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY seat_holds_public_read ON public.seat_holds
    FOR SELECT USING (true);

CREATE POLICY seat_holds_insert_owner ON public.seat_holds
    FOR INSERT WITH CHECK ((lower(wallet_address) = lower(public.wallet_address())));

CREATE POLICY seat_holds_delete_owner ON public.seat_holds
    FOR DELETE USING ((lower(wallet_address) = lower(public.wallet_address())));

-- ─── shop_orders ─────────────────────────────────────────────────────────────
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_access ON public.shop_orders
    FOR SELECT USING (
        (lower(buyer_address) = lower(public.wallet_address()))
        OR (EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = shop_orders.shop_id
              AND lower(shops.owner_address) = lower(public.wallet_address())
        ))
        OR public.is_admin()
    );

CREATE POLICY orders_buyer_insert ON public.shop_orders
    FOR INSERT WITH CHECK ((lower(buyer_address) = lower(public.wallet_address())));

CREATE POLICY orders_update_access ON public.shop_orders
    FOR UPDATE USING (
        (lower(buyer_address) = lower(public.wallet_address()))
        OR (EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = shop_orders.shop_id
              AND lower(shops.owner_address) = lower(public.wallet_address())
        ))
        OR public.is_admin()
    );

-- ─── shop_products ───────────────────────────────────────────────────────────
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_public_read ON public.shop_products
    FOR SELECT USING (true);

CREATE POLICY products_vendor_manage ON public.shop_products
    USING (
        (EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = shop_products.shop_id
              AND lower(shops.owner_address) = lower(public.wallet_address())
        ))
        OR public.is_admin()
    );

-- ─── shop_venues ─────────────────────────────────────────────────────────────
-- No policies: only service_role (bypasses RLS) can access.
ALTER TABLE public.shop_venues ENABLE ROW LEVEL SECURITY;

-- ─── shops ───────────────────────────────────────────────────────────────────
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY shops_public_read ON public.shops
    FOR SELECT USING (true);

CREATE POLICY shops_insert_owner ON public.shops
    FOR INSERT WITH CHECK (
        (lower(owner_address) = lower(public.wallet_address()))
        OR public.is_admin()
    );

CREATE POLICY shops_update_owner ON public.shops
    FOR UPDATE USING (
        (lower(owner_address) = lower(public.wallet_address()))
        OR public.is_admin()
    );

CREATE POLICY shops_vendor_manage ON public.shops
    FOR UPDATE USING (
        (lower(owner_address) = lower(public.wallet_address()))
        OR public.is_admin()
    );

-- ─── tickets ─────────────────────────────────────────────────────────────────
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY tickets_owner_access ON public.tickets
    FOR SELECT USING (
        (lower(owner_address) = lower(public.wallet_address()))
        OR public.is_admin()
    );

CREATE POLICY tickets_admin_insert ON public.tickets
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY tickets_owner_update ON public.tickets
    FOR UPDATE USING (
        (lower(owner_address) = lower(public.wallet_address()))
        OR public.is_admin()
    );

-- ─── user_profiles ───────────────────────────────────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_owner_access ON public.user_profiles
    FOR SELECT USING (
        (lower(wallet_address) = lower(public.wallet_address()))
        OR public.is_admin()
    );

CREATE POLICY profiles_owner_update ON public.user_profiles
    FOR UPDATE USING (
        (lower(wallet_address) = lower(public.wallet_address()))
        OR public.is_admin()
    );

CREATE POLICY profiles_owner_insert ON public.user_profiles
    FOR INSERT WITH CHECK (
        (lower(wallet_address) = lower(public.wallet_address()))
        OR public.is_admin()
    );

-- ─── vault_event_balances ────────────────────────────────────────────────────
ALTER TABLE public.vault_event_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY vault_balances_admin_select ON public.vault_event_balances
    FOR SELECT USING (public.is_admin());

-- ─── venues ──────────────────────────────────────────────────────────────────
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY venues_public_read ON public.venues
    FOR SELECT USING (true);

CREATE POLICY venues_admin_manage ON public.venues
    USING (public.is_admin());

-- ─── walk_in_tickets ─────────────────────────────────────────────────────────
ALTER TABLE public.walk_in_tickets ENABLE ROW LEVEL SECURITY;

-- Anonymous users cannot read walk-in tickets
CREATE POLICY walkin_no_anon ON public.walk_in_tickets
    FOR SELECT USING (false);

CREATE POLICY walk_in_tickets_insert_admin ON public.walk_in_tickets
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY walk_in_tickets_update_admin ON public.walk_in_tickets
    FOR UPDATE USING (public.is_admin());

CREATE POLICY walkin_admin_all ON public.walk_in_tickets
    USING (public.is_admin());
