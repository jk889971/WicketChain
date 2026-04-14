-- Extensions required by the public schema
-- uuid-ossp provides extensions.uuid_generate_v4() used as default PK values
-- pgcrypto provides cryptographic functions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
