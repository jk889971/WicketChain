-- All 16 public schema tables in dependency order.
-- Primary keys and unique constraints are inline.
-- Foreign key constraints are at the bottom of this file.

-- ─── venues ──────────────────────────────────────────────────────────────────
CREATE TABLE public.venues (
    id              uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    venue_id_onchain bigint NOT NULL,
    name            text NOT NULL,
    city            text NOT NULL,
    is_active       boolean DEFAULT true NOT NULL,
    created_at      timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT venues_pkey PRIMARY KEY (id),
    CONSTRAINT venues_venue_id_onchain_key UNIQUE (venue_id_onchain)
);

GRANT ALL ON TABLE public.venues TO anon;
GRANT ALL ON TABLE public.venues TO authenticated;
GRANT ALL ON TABLE public.venues TO service_role;

-- ─── enclosures ──────────────────────────────────────────────────────────────
CREATE TABLE public.enclosures (
    id                    uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    venue_id              uuid NOT NULL,
    enclosure_id_onchain  bigint NOT NULL,
    name                  text NOT NULL,
    total_seats           integer DEFAULT 0 NOT NULL,
    is_active             boolean DEFAULT true NOT NULL,
    category              public.enclosure_category DEFAULT 'GENERAL'::public.enclosure_category NOT NULL,
    color                 text DEFAULT '#F5A623'::text NOT NULL,
    svg_path_id           text,
    CONSTRAINT enclosures_pkey PRIMARY KEY (id),
    CONSTRAINT enclosures_venue_id_enclosure_id_onchain_key UNIQUE (venue_id, enclosure_id_onchain)
);

GRANT ALL ON TABLE public.enclosures TO anon;
GRANT ALL ON TABLE public.enclosures TO authenticated;
GRANT ALL ON TABLE public.enclosures TO service_role;

-- ─── enclosure_rows ──────────────────────────────────────────────────────────
CREATE TABLE public.enclosure_rows (
    id           uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    enclosure_id uuid NOT NULL,
    row_label    character(1) NOT NULL,
    seat_count   integer NOT NULL,
    seat_numbers integer[] DEFAULT '{}'::integer[],
    CONSTRAINT enclosure_rows_pkey PRIMARY KEY (id),
    CONSTRAINT enclosure_rows_enclosure_id_row_label_key UNIQUE (enclosure_id, row_label)
);

GRANT ALL ON TABLE public.enclosure_rows TO anon;
GRANT ALL ON TABLE public.enclosure_rows TO authenticated;
GRANT ALL ON TABLE public.enclosure_rows TO service_role;

-- ─── events ──────────────────────────────────────────────────────────────────
CREATE TABLE public.events (
    id                    uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id_onchain      bigint NOT NULL,
    venue_id              uuid NOT NULL,
    match_title           text NOT NULL,
    start_time            timestamp with time zone NOT NULL,
    end_time              timestamp with time zone NOT NULL,
    status                public.event_status DEFAULT 'CREATED'::public.event_status NOT NULL,
    event_manager_address text NOT NULL,
    image_url             text,
    created_at            timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT events_pkey PRIMARY KEY (id),
    CONSTRAINT events_event_id_onchain_key UNIQUE (event_id_onchain)
);

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;

-- ─── event_pricing ───────────────────────────────────────────────────────────
CREATE TABLE public.event_pricing (
    id           uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id     uuid NOT NULL,
    enclosure_id uuid NOT NULL,
    price_wei    numeric(78,0) NOT NULL,
    price_display text,
    sold_seats   integer DEFAULT 0 NOT NULL,
    CONSTRAINT event_pricing_pkey PRIMARY KEY (id),
    CONSTRAINT event_pricing_event_id_enclosure_id_key UNIQUE (event_id, enclosure_id)
);

GRANT ALL ON TABLE public.event_pricing TO anon;
GRANT ALL ON TABLE public.event_pricing TO authenticated;
GRANT ALL ON TABLE public.event_pricing TO service_role;

-- ─── seat_holds ──────────────────────────────────────────────────────────────
CREATE TABLE public.seat_holds (
    id             uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id       uuid NOT NULL,
    enclosure_id   uuid NOT NULL,
    row_label      character(1) NOT NULL,
    seat_number    integer NOT NULL,
    wallet_address text NOT NULL,
    expires_at     timestamp with time zone DEFAULT (now() + '00:10:00'::interval) NOT NULL,
    created_at     timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT seat_holds_pkey PRIMARY KEY (id),
    CONSTRAINT seat_holds_event_id_enclosure_id_row_label_seat_number_key
        UNIQUE (event_id, enclosure_id, row_label, seat_number)
);

GRANT ALL ON TABLE public.seat_holds TO anon;
GRANT ALL ON TABLE public.seat_holds TO authenticated;
GRANT ALL ON TABLE public.seat_holds TO service_role;

-- ─── tickets ─────────────────────────────────────────────────────────────────
CREATE TABLE public.tickets (
    id                  uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    token_id            bigint NOT NULL,
    event_id            uuid NOT NULL,
    venue_id            uuid NOT NULL,
    enclosure_id        uuid NOT NULL,
    row_label           character(1) NOT NULL,
    seat_number         integer NOT NULL,
    owner_address       text NOT NULL,
    purchase_price_wei  numeric(78,0) NOT NULL,
    is_returned         boolean DEFAULT false NOT NULL,
    is_walk_in          boolean DEFAULT false NOT NULL,
    is_entered          boolean DEFAULT false NOT NULL,
    delegate_address    text,
    tx_hash             text,
    created_at          timestamp with time zone DEFAULT now() NOT NULL,
    refund_claimed      boolean DEFAULT false NOT NULL,
    is_force_refunded   boolean DEFAULT false NOT NULL,
    CONSTRAINT tickets_pkey PRIMARY KEY (id),
    CONSTRAINT tickets_token_id_key UNIQUE (token_id)
);

GRANT ALL ON TABLE public.tickets TO anon;
GRANT ALL ON TABLE public.tickets TO authenticated;
GRANT ALL ON TABLE public.tickets TO service_role;

-- ─── shops ───────────────────────────────────────────────────────────────────
CREATE TABLE public.shops (
    id               uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    shop_id_onchain  bigint NOT NULL,
    owner_address    text NOT NULL,
    name             text NOT NULL,
    description      text,
    image_url        text,
    is_approved      boolean DEFAULT false NOT NULL,
    is_active        boolean DEFAULT true NOT NULL,
    created_at       timestamp with time zone DEFAULT now() NOT NULL,
    rejection_reason text,
    CONSTRAINT shops_pkey PRIMARY KEY (id),
    CONSTRAINT shops_shop_id_onchain_key UNIQUE (shop_id_onchain)
);

GRANT ALL ON TABLE public.shops TO anon;
GRANT ALL ON TABLE public.shops TO authenticated;
GRANT ALL ON TABLE public.shops TO service_role;

-- ─── shop_venues ─────────────────────────────────────────────────────────────
CREATE TABLE public.shop_venues (
    id               uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    shop_id          uuid NOT NULL,
    venue_id         uuid NOT NULL,
    location_in_venue text,
    is_active        boolean DEFAULT true NOT NULL,
    CONSTRAINT shop_venues_pkey PRIMARY KEY (id),
    CONSTRAINT shop_venues_shop_id_venue_id_key UNIQUE (shop_id, venue_id)
);

GRANT ALL ON TABLE public.shop_venues TO anon;
GRANT ALL ON TABLE public.shop_venues TO authenticated;
GRANT ALL ON TABLE public.shop_venues TO service_role;

-- ─── shop_products ───────────────────────────────────────────────────────────
CREATE TABLE public.shop_products (
    id                   uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    product_id_onchain   bigint NOT NULL,
    shop_id              uuid NOT NULL,
    venue_id             uuid NOT NULL,
    name                 text NOT NULL,
    image_url            text,
    price_wei            numeric(78,0) NOT NULL,
    price_display        text,
    available_units      integer DEFAULT 0 NOT NULL,
    is_active            boolean DEFAULT true NOT NULL,
    created_at           timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT shop_products_pkey PRIMARY KEY (id),
    CONSTRAINT shop_products_product_id_onchain_key UNIQUE (product_id_onchain)
);

GRANT ALL ON TABLE public.shop_products TO anon;
GRANT ALL ON TABLE public.shop_products TO authenticated;
GRANT ALL ON TABLE public.shop_products TO service_role;

-- ─── shop_orders ─────────────────────────────────────────────────────────────
CREATE TABLE public.shop_orders (
    id               uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id_onchain bigint NOT NULL,
    ticket_token_id  bigint NOT NULL,
    product_id       uuid NOT NULL,
    shop_id          uuid NOT NULL,
    venue_id         uuid NOT NULL,
    quantity         integer NOT NULL,
    total_paid_wei   numeric(78,0) NOT NULL,
    buyer_address    text NOT NULL,
    status           public.order_status DEFAULT 'ACTIVE'::public.order_status NOT NULL,
    tx_hash          text,
    created_at       timestamp with time zone DEFAULT now() NOT NULL,
    updated_at       timestamp with time zone DEFAULT now() NOT NULL,
    event_id         uuid,
    refund_claimed   boolean DEFAULT false NOT NULL,
    CONSTRAINT shop_orders_pkey PRIMARY KEY (id),
    CONSTRAINT shop_orders_order_id_onchain_key UNIQUE (order_id_onchain)
);

GRANT ALL ON TABLE public.shop_orders TO anon;
GRANT ALL ON TABLE public.shop_orders TO authenticated;
GRANT ALL ON TABLE public.shop_orders TO service_role;

-- ─── vault_event_balances ────────────────────────────────────────────────────
CREATE TABLE public.vault_event_balances (
    id                      uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id                uuid NOT NULL,
    ticket_revenue_wei      numeric(78,0) DEFAULT 0 NOT NULL,
    ticket_refunds_wei      numeric(78,0) DEFAULT 0 NOT NULL,
    shop_revenue_wei        numeric(78,0) DEFAULT 0 NOT NULL,
    shop_refunds_wei        numeric(78,0) DEFAULT 0 NOT NULL,
    shop_fees_wei           numeric(78,0) DEFAULT 0 NOT NULL,
    is_settled              boolean DEFAULT false NOT NULL,
    platform_amount_wei     numeric(78,0) DEFAULT 0 NOT NULL,
    event_manager_amount_wei numeric(78,0) DEFAULT 0 NOT NULL,
    updated_at              timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vault_event_balances_pkey PRIMARY KEY (id),
    CONSTRAINT vault_event_balances_event_id_key UNIQUE (event_id)
);

GRANT ALL ON TABLE public.vault_event_balances TO anon;
GRANT ALL ON TABLE public.vault_event_balances TO authenticated;
GRANT ALL ON TABLE public.vault_event_balances TO service_role;

-- ─── walk_in_tickets ─────────────────────────────────────────────────────────
CREATE TABLE public.walk_in_tickets (
    id              uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    token_id        bigint NOT NULL,
    event_id        uuid NOT NULL,
    enclosure_id    uuid NOT NULL,
    row_label       character(1) NOT NULL,
    seat_number     integer NOT NULL,
    entry_code_hash text NOT NULL,
    is_claimed      boolean DEFAULT false NOT NULL,
    created_at      timestamp with time zone DEFAULT now() NOT NULL,
    secret_nonce    text,
    CONSTRAINT walk_in_tickets_pkey PRIMARY KEY (id),
    CONSTRAINT walk_in_tickets_token_id_key UNIQUE (token_id)
);

GRANT ALL ON TABLE public.walk_in_tickets TO anon;
GRANT ALL ON TABLE public.walk_in_tickets TO authenticated;
GRANT ALL ON TABLE public.walk_in_tickets TO service_role;

-- ─── user_profiles ───────────────────────────────────────────────────────────
CREATE TABLE public.user_profiles (
    id               uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    wallet_address   text NOT NULL,
    full_name        text,
    email            text,
    phone_number     text,
    shipping_address jsonb,
    profile_hash     text,
    created_at       timestamp with time zone DEFAULT now() NOT NULL,
    updated_at       timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_wallet_address_key UNIQUE (wallet_address)
);

GRANT ALL ON TABLE public.user_profiles TO anon;
GRANT ALL ON TABLE public.user_profiles TO authenticated;
GRANT ALL ON TABLE public.user_profiles TO service_role;

-- ─── auth_nonces ─────────────────────────────────────────────────────────────
CREATE TABLE public.auth_nonces (
    nonce          text NOT NULL,
    wallet_address text NOT NULL,
    created_at     timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT auth_nonces_pkey PRIMARY KEY (nonce)
);

GRANT ALL ON TABLE public.auth_nonces TO anon;
GRANT ALL ON TABLE public.auth_nonces TO authenticated;
GRANT ALL ON TABLE public.auth_nonces TO service_role;

-- ─── indexer_state ───────────────────────────────────────────────────────────
CREATE TABLE public.indexer_state (
    indexer_name         text NOT NULL,
    last_processed_block bigint DEFAULT 0 NOT NULL,
    updated_at           timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT indexer_state_pkey PRIMARY KEY (indexer_name)
);

GRANT ALL ON TABLE public.indexer_state TO anon;
GRANT ALL ON TABLE public.indexer_state TO authenticated;
GRANT ALL ON TABLE public.indexer_state TO service_role;


-- ─── Foreign Key Constraints ──────────────────────────────────────────────────

ALTER TABLE ONLY public.enclosures
    ADD CONSTRAINT enclosures_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.enclosure_rows
    ADD CONSTRAINT enclosure_rows_enclosure_id_fkey
    FOREIGN KEY (enclosure_id) REFERENCES public.enclosures(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES public.venues(id);

ALTER TABLE ONLY public.event_pricing
    ADD CONSTRAINT event_pricing_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.event_pricing
    ADD CONSTRAINT event_pricing_enclosure_id_fkey
    FOREIGN KEY (enclosure_id) REFERENCES public.enclosures(id);

ALTER TABLE ONLY public.seat_holds
    ADD CONSTRAINT seat_holds_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.seat_holds
    ADD CONSTRAINT seat_holds_enclosure_id_fkey
    FOREIGN KEY (enclosure_id) REFERENCES public.enclosures(id);

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id);

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES public.venues(id);

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_enclosure_id_fkey
    FOREIGN KEY (enclosure_id) REFERENCES public.enclosures(id);

ALTER TABLE ONLY public.shop_venues
    ADD CONSTRAINT shop_venues_shop_id_fkey
    FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.shop_venues
    ADD CONSTRAINT shop_venues_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES public.venues(id);

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_shop_id_fkey
    FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES public.venues(id);

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.shop_products(id);

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_shop_id_fkey
    FOREIGN KEY (shop_id) REFERENCES public.shops(id);

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES public.venues(id);

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id);

ALTER TABLE ONLY public.vault_event_balances
    ADD CONSTRAINT vault_event_balances_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id);

ALTER TABLE ONLY public.walk_in_tickets
    ADD CONSTRAINT walk_in_tickets_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id);

ALTER TABLE ONLY public.walk_in_tickets
    ADD CONSTRAINT walk_in_tickets_enclosure_id_fkey
    FOREIGN KEY (enclosure_id) REFERENCES public.enclosures(id);

ALTER TABLE ONLY public.walk_in_tickets
    ADD CONSTRAINT walk_in_tickets_token_id_fkey
    FOREIGN KEY (token_id) REFERENCES public.tickets(token_id);
