-- Indexes on all public schema tables

-- enclosure_rows
CREATE INDEX idx_enclosure_rows_enclosure ON public.enclosure_rows USING btree (enclosure_id);

-- enclosures
CREATE INDEX idx_enclosures_venue ON public.enclosures USING btree (venue_id);

-- event_pricing
CREATE INDEX idx_event_pricing_event ON public.event_pricing USING btree (event_id);

-- events
CREATE INDEX idx_events_onchain ON public.events USING btree (event_id_onchain);
CREATE INDEX idx_events_start   ON public.events USING btree (start_time);
CREATE INDEX idx_events_status  ON public.events USING btree (status);
CREATE INDEX idx_events_venue   ON public.events USING btree (venue_id);

-- seat_holds
CREATE INDEX idx_seat_holds_event   ON public.seat_holds USING btree (event_id, enclosure_id);
CREATE INDEX idx_seat_holds_expires ON public.seat_holds USING btree (expires_at);

-- shop_orders
CREATE INDEX idx_orders_buyer  ON public.shop_orders USING btree (buyer_address);
CREATE INDEX idx_orders_event  ON public.shop_orders USING btree (event_id);
CREATE INDEX idx_orders_shop   ON public.shop_orders USING btree (shop_id);
CREATE INDEX idx_orders_status ON public.shop_orders USING btree (status);
CREATE INDEX idx_orders_ticket ON public.shop_orders USING btree (ticket_token_id);

CREATE INDEX idx_orders_refund_claimed ON public.shop_orders USING btree (buyer_address, refund_claimed)
    WHERE (
        (status = 'REFUNDED'::public.order_status OR status = 'CANCELLED'::public.order_status)
        AND refund_claimed = false
    );

-- shop_products
CREATE INDEX idx_products_shop  ON public.shop_products USING btree (shop_id);
CREATE INDEX idx_products_venue ON public.shop_products USING btree (venue_id);

-- shop_venues
CREATE INDEX idx_shop_venues_venue ON public.shop_venues USING btree (venue_id);

-- shops
CREATE INDEX idx_shops_onchain ON public.shops USING btree (shop_id_onchain);
CREATE INDEX idx_shops_owner   ON public.shops USING btree (owner_address);

-- tickets
CREATE INDEX idx_tickets_event ON public.tickets USING btree (event_id);
CREATE INDEX idx_tickets_owner ON public.tickets USING btree (owner_address);
CREATE INDEX idx_tickets_seat  ON public.tickets USING btree (event_id, enclosure_id, row_label, seat_number);

-- Partial unique index: only one non-returned ticket per seat per event
CREATE UNIQUE INDEX idx_tickets_seat_unique ON public.tickets USING btree (event_id, enclosure_id, row_label, seat_number)
    WHERE (is_returned = false);

CREATE INDEX idx_tickets_force_refunded ON public.tickets USING btree (event_id, is_returned, is_force_refunded)
    WHERE (is_returned = true AND is_force_refunded = true);

CREATE INDEX idx_tickets_refund_claimed ON public.tickets USING btree (owner_address, is_returned, refund_claimed)
    WHERE (is_returned = true AND refund_claimed = false);

-- user_profiles
CREATE INDEX idx_profiles_wallet ON public.user_profiles USING btree (wallet_address);

-- venues
CREATE INDEX idx_venues_onchain ON public.venues USING btree (venue_id_onchain);

-- walk_in_tickets
CREATE INDEX idx_walkin_code  ON public.walk_in_tickets USING btree (entry_code_hash);
CREATE INDEX idx_walkin_event ON public.walk_in_tickets USING btree (event_id);
