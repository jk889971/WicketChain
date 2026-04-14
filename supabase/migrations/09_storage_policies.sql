-- RLS policies on storage.objects for WicketChain storage buckets.
-- These buckets must be created separately via the Supabase dashboard or seed.sql:
--   - match-images  (public read, admin write)
--   - shop-images   (authenticated read/write)

-- ─── match-images bucket ─────────────────────────────────────────────────────

CREATE POLICY match_images_select ON storage.objects
    FOR SELECT USING ((bucket_id = 'match-images'::text));

CREATE POLICY match_images_insert_admin ON storage.objects
    FOR INSERT WITH CHECK (
        (bucket_id = 'match-images'::text) AND public.is_admin()
    );

CREATE POLICY match_images_update_admin ON storage.objects
    FOR UPDATE USING (
        (bucket_id = 'match-images'::text) AND public.is_admin()
    );

-- ─── shop-images bucket ──────────────────────────────────────────────────────

CREATE POLICY shop_images_select ON storage.objects
    FOR SELECT TO authenticated, anon
    USING ((bucket_id = 'shop-images'::text));

CREATE POLICY shop_images_insert_auth ON storage.objects
    FOR INSERT WITH CHECK (
        (bucket_id = 'shop-images'::text)
        AND (public.wallet_address() IS NOT NULL)
    );

CREATE POLICY shop_images_update_auth ON storage.objects
    FOR UPDATE USING (
        (bucket_id = 'shop-images'::text)
        AND (public.wallet_address() IS NOT NULL)
    );

CREATE POLICY shop_images_delete_auth ON storage.objects
    FOR DELETE USING (
        (bucket_id = 'shop-images'::text)
        AND (public.wallet_address() IS NOT NULL)
    );
