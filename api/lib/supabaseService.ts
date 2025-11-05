// api/lib/supabaseService.ts
import { createClient } from "@supabase/supabase-js";

// In Vercel serverless functions, use standard env var names (no VITE_ prefix)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("SUPABASE_URL or SUPABASE_ANON_KEY not found in environment variables.");
    throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function executeQuery(sqlQuery: string): Promise<any[] | null> {
    try {
        const { data, error } = await supabase.rpc('execute_sql', { query: sqlQuery });
        
        if (error) {
            console.error("Supabase RPC Error:", error);
            throw new Error(
                "Direct query execution requires the 'execute_sql' RPC function. " +
                "Please run the SQL script provided in the documentation in your Supabase SQL Editor.\n\n" +
                `The query I attempted to run was:\n\`\`\`sql\n${sqlQuery}\n\`\`\`\n\n` +
                `Error details: ${error.message}`
            );
        }
        
        return data as any[] | null;
    } catch (error: any) {
        console.error("Error in executeQuery:", error.message);
        throw error;
    }
}