-- Add public tables to the Supabase Realtime publication.
-- The supabase_realtime publication is created automatically by Supabase;
-- we only need to register the tables we want to broadcast changes for.

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.event_pricing;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.seat_holds;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.shop_orders;
