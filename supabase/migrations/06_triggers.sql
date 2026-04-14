-- Triggers on public schema tables
-- All call public.update_updated_at() defined in 05_functions.sql

CREATE TRIGGER trg_shop_orders_updated
    BEFORE UPDATE ON public.shop_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_user_profiles_updated
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_vault_event_updated
    BEFORE UPDATE ON public.vault_event_balances
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
