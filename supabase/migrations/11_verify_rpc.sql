-- ─── get_verify_ticket_data(bigint[]) ────────────────────────────────────────
-- Returns ticket verify data for the given token IDs, bypassing RLS.
-- Used exclusively by the /verify page so delegates can read tickets they don't own.
-- Only exposes the minimum fields required for display (no owner PII beyond
-- what is already public on-chain via ownerOf / getDelegate).
CREATE OR REPLACE FUNCTION public.get_verify_ticket_data(p_token_ids bigint[])
RETURNS TABLE(
  token_id        bigint,
  seat_number     integer,
  row_label       character,
  match_title     text,
  start_time      timestamptz,
  venue_name      text,
  venue_city      text,
  enclosure_name  text,
  orders          jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.token_id,
    t.seat_number,
    t.row_label,
    e.match_title,
    e.start_time,
    v.name  AS venue_name,
    v.city  AS venue_city,
    enc.name AS enclosure_name,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object(
          'orderId',      so.order_id_onchain,
          'productName',  sp.name,
          'quantity',     so.quantity,
          'totalPaidWei', so.total_paid_wei,
          'status',       so.status::text
        ) ORDER BY so.created_at ASC)
        FROM shop_orders so
        JOIN shop_products sp ON sp.id = so.product_id
        WHERE so.ticket_token_id = t.token_id
          AND so.status NOT IN ('CANCELLED', 'REFUNDED')
      ),
      '[]'::jsonb
    ) AS orders
  FROM tickets t
  LEFT JOIN events e   ON e.id  = t.event_id
  LEFT JOIN venues v   ON v.id  = e.venue_id
  LEFT JOIN enclosures enc ON enc.id = t.enclosure_id
  WHERE t.token_id = ANY(p_token_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_verify_ticket_data(bigint[]) TO anon;
GRANT EXECUTE ON FUNCTION public.get_verify_ticket_data(bigint[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_verify_ticket_data(bigint[]) TO service_role;
