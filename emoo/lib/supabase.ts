import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Prevent Next.js Turbopack dev overlay from aggressively catching Supabase token errors
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" && 
      args[0].includes("AuthApiError") && 
      args[0].includes("Refresh Token Not Found")
    ) {
      return;
    }
    if (args[0] && args[0].name === "AuthApiError" && args[0].message?.includes("Refresh Token Not Found")) {
      return;
    }
    originalConsoleError(...args);
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);