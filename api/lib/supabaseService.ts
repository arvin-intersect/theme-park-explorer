// arvin-intersect-theme-park-explorer/src/api/lib/supabaseService.ts
import { createClient } from "@supabase/supabase-js";

// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are available in the environment
// (e.g., .env file for local dev, Vercel env vars for deployment)
const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    // In a serverless environment, this is critical.
    // If these are undefined, the build/runtime will fail early.
    console.error("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in environment variables.");
    throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function executeQuery(sqlQuery: string): Promise<any[] | null> {
    try {
        // Calling the custom PostgreSQL RPC function 'execute_sql'
        const { data, error } = await supabase.rpc('execute_sql', { query: sqlQuery });

        if (error) {
            console.error("Supabase RPC Error:", error);
            // Re-throw with more context for frontend display
            throw new Error(
                "Direct query execution requires the 'execute_sql' RPC function. " +
                "Please run the SQL script provided in the documentation in your Supabase SQL Editor.\n\n" +
                `The query I attempted to run was:\n\`\`\`sql\n${sqlQuery}\n\`\`\`\n\n` +
                `Error details: ${error.message}`
            );
        }
        return data as any[] | null;
    } catch (error: any) {
        // Catch any other unexpected errors during query execution
        console.error("Error in executeQuery:", error.message);
        throw error;
    }
}