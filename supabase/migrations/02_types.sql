-- Custom ENUM types for the WicketChain public schema

CREATE TYPE public.enclosure_category AS ENUM (
    'GENERAL',
    'FIRST_CLASS',
    'PREMIUM',
    'VIP',
    'VVIP',
    'VVIP_GALLERY'
);

CREATE TYPE public.event_status AS ENUM (
    'CREATED',
    'LIVE',
    'REFUNDS_CLOSED',
    'GATES_OPEN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'POSTPONED'
);

CREATE TYPE public.order_status AS ENUM (
    'ACTIVE',
    'CONFIRMED',
    'COLLECTED',
    'CANCELLED',
    'REFUNDED'
);

CREATE TYPE public.vault_category AS ENUM (
    'TICKET_REVENUE',
    'SHOP_REVENUE',
    'DONATION'
);

CREATE TYPE public.verification_result AS ENUM (
    'SUCCESS',
    'EXPIRED_QR',
    'INVALID_SIGNATURE',
    'NOT_AUTHORIZED',
    'ALREADY_ENTERED',
    'EVENT_CANCELLED'
);
