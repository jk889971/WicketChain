-- Public schema views

-- ─── v_event_seat_availability ───────────────────────────────────────────────
-- Real-time seat availability per row for LIVE / GATES_OPEN events.
CREATE VIEW public.v_event_seat_availability AS
 SELECT e.id AS event_id,
    e.event_id_onchain,
    e.match_title,
    enc.id AS enclosure_id,
    enc.name AS enclosure_name,
    er.row_label,
    er.seat_count AS total_seats_in_row,
    COALESCE(booked.count, (0)::bigint) AS booked_seats,
    COALESCE(held.count, (0)::bigint) AS held_seats,
    (er.seat_count - COALESCE(booked.count, (0)::bigint)) AS available_seats
   FROM ((((public.events e
     JOIN public.enclosures enc ON ((enc.venue_id = e.venue_id)))
     JOIN public.enclosure_rows er ON ((er.enclosure_id = enc.id)))
     LEFT JOIN ( SELECT tickets.event_id,
            tickets.enclosure_id,
            tickets.row_label,
            count(*) AS count
           FROM public.tickets
          WHERE (tickets.is_returned = false)
          GROUP BY tickets.event_id, tickets.enclosure_id, tickets.row_label) booked ON (((booked.event_id = e.id) AND (booked.enclosure_id = enc.id) AND (booked.row_label = er.row_label))))
     LEFT JOIN ( SELECT seat_holds.event_id,
            seat_holds.enclosure_id,
            seat_holds.row_label,
            count(*) AS count
           FROM public.seat_holds
          WHERE (seat_holds.expires_at > now())
          GROUP BY seat_holds.event_id, seat_holds.enclosure_id, seat_holds.row_label) held ON (((held.event_id = e.id) AND (held.enclosure_id = enc.id) AND (held.row_label = er.row_label))))
  WHERE (e.status = ANY (ARRAY['LIVE'::public.event_status, 'GATES_OPEN'::public.event_status]));

GRANT ALL ON TABLE public.v_event_seat_availability TO anon;
GRANT ALL ON TABLE public.v_event_seat_availability TO authenticated;
GRANT ALL ON TABLE public.v_event_seat_availability TO service_role;

-- ─── v_events_listing ────────────────────────────────────────────────────────
-- Events listing with venue info and aggregated enclosure pricing.
CREATE VIEW public.v_events_listing AS
 SELECT e.id,
    e.event_id_onchain,
    e.match_title,
    e.start_time,
    e.end_time,
    e.status,
    e.image_url AS event_image,
    v.id AS venue_id,
    v.name AS venue_name,
    v.city,
    ( SELECT json_agg(json_build_object('enclosure_id', enc.id, 'name', enc.name, 'total_seats', enc.total_seats, 'price_wei', ep.price_wei, 'price_display', ep.price_display, 'sold_seats', ep.sold_seats)) AS json_agg
           FROM (public.enclosures enc
             LEFT JOIN public.event_pricing ep ON (((ep.enclosure_id = enc.id) AND (ep.event_id = e.id))))
          WHERE ((enc.venue_id = v.id) AND (enc.is_active = true))) AS enclosures
   FROM (public.events e
     JOIN public.venues v ON ((v.id = e.venue_id)))
  ORDER BY e.start_time;

GRANT ALL ON TABLE public.v_events_listing TO anon;
GRANT ALL ON TABLE public.v_events_listing TO authenticated;
GRANT ALL ON TABLE public.v_events_listing TO service_role;

-- ─── v_my_tickets ────────────────────────────────────────────────────────────
-- Personalized ticket view with full event, venue and enclosure details.
CREATE VIEW public.v_my_tickets AS
 SELECT t.id,
    t.token_id,
    t.row_label,
    t.seat_number,
    t.purchase_price_wei,
    t.is_returned,
    t.is_entered,
    t.is_walk_in,
    t.delegate_address,
    t.created_at,
    e.event_id_onchain,
    e.match_title,
    e.start_time,
    e.end_time,
    e.status AS event_status,
    v.name AS venue_name,
    v.city,
    enc.name AS enclosure_name,
    t.owner_address
   FROM (((public.tickets t
     JOIN public.events e ON ((e.id = t.event_id)))
     JOIN public.venues v ON ((v.id = t.venue_id)))
     JOIN public.enclosures enc ON ((enc.id = t.enclosure_id)));

GRANT ALL ON TABLE public.v_my_tickets TO anon;
GRANT ALL ON TABLE public.v_my_tickets TO authenticated;
GRANT ALL ON TABLE public.v_my_tickets TO service_role;

-- ─── v_shop_products_browse ──────────────────────────────────────────────────
-- Browsable shop product listing (approved shops, active products with stock).
CREATE VIEW public.v_shop_products_browse AS
 SELECT sp.id AS product_id,
    sp.product_id_onchain,
    sp.name AS product_name,
    sp.image_url AS product_image,
    sp.price_wei,
    sp.price_display,
    sp.available_units,
    s.id AS shop_id,
    s.shop_id_onchain,
    s.name AS shop_name,
    s.image_url AS shop_image,
    sv.venue_id,
    v.name AS venue_name,
    sv.location_in_venue
   FROM (((public.shop_products sp
     JOIN public.shops s ON ((s.id = sp.shop_id)))
     JOIN public.shop_venues sv ON (((sv.shop_id = s.id) AND (sv.venue_id = sp.venue_id))))
     JOIN public.venues v ON ((v.id = sp.venue_id)))
  WHERE ((s.is_approved = true) AND (s.is_active = true) AND (sp.is_active = true) AND (sp.available_units > 0));

GRANT ALL ON TABLE public.v_shop_products_browse TO anon;
GRANT ALL ON TABLE public.v_shop_products_browse TO authenticated;
GRANT ALL ON TABLE public.v_shop_products_browse TO service_role;
