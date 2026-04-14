import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    fetch: (url, options = {}) => {
      // 1. Check if we're in the browser and have a valid SIWE token
      const token = typeof window !== "undefined" ? localStorage.getItem("siwe_token") : null;
      
      // 2. If present, force inject it over the default Anon key Authorization header
      if (token) {
        options.headers = new Headers(options.headers || {});
        options.headers.set("Authorization", `Bearer ${token}`);
      }
      
      return fetch(url, options);
    },
  },
});
