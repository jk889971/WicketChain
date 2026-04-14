-- All public schema functions
-- Note: update_updated_at() must come before triggers that reference it (06_triggers.sql)

-- ─── wallet_address() ────────────────────────────────────────────────────────
-- Extracts the wallet_address claim from the current JWT.
CREATE FUNCTION public.wallet_address() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT (auth.jwt() ->> 'wallet_address');
$$;

GRANT ALL ON FUNCTION public.wallet_address() TO anon;
GRANT ALL ON FUNCTION public.wallet_address() TO authenticated;
GRANT ALL ON FUNCTION public.wallet_address() TO service_role;

-- ─── is_admin() ──────────────────────────────────────────────────────────────
-- Returns true if the current JWT has is_admin = true.
CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  RETURN (auth.jwt() ->> 'is_admin')::boolean = true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;

-- ─── update_updated_at() ─────────────────────────────────────────────────────
-- Trigger function: sets NEW.updated_at = now() before any UPDATE.
CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

GRANT ALL ON FUNCTION public.update_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at() TO service_role;

-- ─── cleanup_expired_holds() ─────────────────────────────────────────────────
-- Deletes all seat_holds past their expiry. Returns void.
CREATE FUNCTION public.cleanup_expired_holds() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM seat_holds WHERE expires_at < now();
END;
$$;

GRANT ALL ON FUNCTION public.cleanup_expired_holds() TO anon;
GRANT ALL ON FUNCTION public.cleanup_expired_holds() TO authenticated;
GRANT ALL ON FUNCTION public.cleanup_expired_holds() TO service_role;

-- ─── fn_cleanup_expired_holds() ──────────────────────────────────────────────
-- Same as cleanup_expired_holds() but returns the number of rows deleted.
CREATE FUNCTION public.fn_cleanup_expired_holds() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM seat_holds WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

GRANT ALL ON FUNCTION public.fn_cleanup_expired_holds() TO anon;
GRANT ALL ON FUNCTION public.fn_cleanup_expired_holds() TO authenticated;
GRANT ALL ON FUNCTION public.fn_cleanup_expired_holds() TO service_role;

-- ─── fn_mark_refunds_claimed(text) ───────────────────────────────────────────
-- Marks all refunded/cancelled shop_orders and returned tickets as claimed
-- for a given buyer wallet address.
CREATE FUNCTION public.fn_mark_refunds_claimed(p_buyer_address text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE shop_orders
  SET refund_claimed = true
  WHERE buyer_address = p_buyer_address
    AND status IN ('REFUNDED', 'CANCELLED')
    AND refund_claimed = false;

  UPDATE tickets
  SET refund_claimed = true
  WHERE owner_address = p_buyer_address
    AND is_returned = true
    AND refund_claimed = false;
END;
$$;

GRANT ALL ON FUNCTION public.fn_mark_refunds_claimed(p_buyer_address text) TO anon;
GRANT ALL ON FUNCTION public.fn_mark_refunds_claimed(p_buyer_address text) TO authenticated;
GRANT ALL ON FUNCTION public.fn_mark_refunds_claimed(p_buyer_address text) TO service_role;

-- ─── decrement_product_units(uuid, integer) ──────────────────────────────────
-- Decrements available_units for a shop product, floored at 0.
CREATE FUNCTION public.decrement_product_units(p_product_id uuid, p_qty integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE shop_products
  SET available_units = GREATEST(0, available_units - p_qty)
  WHERE id = p_product_id;
END;
$$;

GRANT ALL ON FUNCTION public.decrement_product_units(p_product_id uuid, p_qty integer) TO anon;
GRANT ALL ON FUNCTION public.decrement_product_units(p_product_id uuid, p_qty integer) TO authenticated;
GRANT ALL ON FUNCTION public.decrement_product_units(p_product_id uuid, p_qty integer) TO service_role;

-- ─── increment_sold_seats(uuid, uuid) ────────────────────────────────────────
-- Increments sold_seats counter in event_pricing for a given event+enclosure.
CREATE FUNCTION public.increment_sold_seats(p_event_id uuid, p_enclosure_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  UPDATE event_pricing SET sold_seats = sold_seats + 1
  WHERE event_id = p_event_id AND enclosure_id = p_enclosure_id;
$$;

GRANT ALL ON FUNCTION public.increment_sold_seats(p_event_id uuid, p_enclosure_id uuid) TO anon;
GRANT ALL ON FUNCTION public.increment_sold_seats(p_event_id uuid, p_enclosure_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.increment_sold_seats(p_event_id uuid, p_enclosure_id uuid) TO service_role;

-- ─── get_seat_map(uuid, uuid) ────────────────────────────────────────────────
-- Returns the combined seat map for an event+enclosure:
--   BOOKED  = minted tickets that have not been returned
--   HELD    = active seat holds (not yet expired)
CREATE FUNCTION public.get_seat_map(p_event_id uuid, p_enclosure_id uuid)
    RETURNS TABLE(row_label character, seat_number integer, status text, holder_wallet text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  RETURN QUERY
  -- Booked seats (on-chain minted)
  SELECT
    t.row_label,
    t.seat_number::INTEGER,
    'BOOKED'::TEXT AS status,
    t.owner_address AS holder_wallet
  FROM tickets t
  WHERE t.event_id = p_event_id
    AND t.enclosure_id = p_enclosure_id
    AND t.is_returned = false

  UNION ALL

  -- Held seats (temporary 10-min holds)
  SELECT
    sh.row_label,
    sh.seat_number,
    'HELD'::TEXT AS status,
    sh.wallet_address AS holder_wallet
  FROM seat_holds sh
  WHERE sh.event_id = p_event_id
    AND sh.enclosure_id = p_enclosure_id
    AND sh.expires_at > now();
END;
$$;

GRANT ALL ON FUNCTION public.get_seat_map(p_event_id uuid, p_enclosure_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_seat_map(p_event_id uuid, p_enclosure_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_seat_map(p_event_id uuid, p_enclosure_id uuid) TO service_role;

-- ─── get_ticket_orders(bigint) ───────────────────────────────────────────────
-- Returns active/confirmed shop orders associated with a specific ticket token.
CREATE FUNCTION public.get_ticket_orders(p_token_id bigint)
    RETURNS TABLE(
        order_id      uuid,
        product_name  text,
        quantity      integer,
        shop_name     text,
        location_in_venue text,
        status        public.order_status
    )
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    so.id AS order_id,
    sp.name AS product_name,
    so.quantity,
    s.name AS shop_name,
    sv.location_in_venue,
    so.status
  FROM shop_orders so
  JOIN shop_products sp ON sp.id = so.product_id
  JOIN shops s ON s.id = so.shop_id
  LEFT JOIN shop_venues sv ON sv.shop_id = s.id AND sv.venue_id = so.venue_id
  WHERE so.ticket_token_id = p_token_id
    AND so.status IN ('ACTIVE', 'CONFIRMED')
  ORDER BY so.created_at ASC;
END;
$$;

GRANT ALL ON FUNCTION public.get_ticket_orders(p_token_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_ticket_orders(p_token_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_ticket_orders(p_token_id bigint) TO service_role;
