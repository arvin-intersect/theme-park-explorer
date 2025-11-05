    // arvin-intersect-theme-park-explorer/src/api/chatbot.ts
    // This file acts as a serverless function endpoint for Vercel.

    import type { VercelRequest, VercelResponse } from '@vercel/node';

    import {
        findCachedQuery,
        generateSqlQueryWithLLM,
        formatResponseWithLLM,
        isCasualMessage,
        getCasualResponse,
    } from './lib/aiService.js';  // ← Add .js
    import { executeQuery } from './lib/supabaseService.js';  // ← Add .js
    import { CACHED_QUERIES, CachedQueryResult } from './lib/constants.js'; 

    // Type definitions for API requests/responses (re-defined for clarity in this endpoint)
    interface QuestionRequestBody {
        question: string;
    }

    interface ApiResponse {
        answer: string;
        sql_query: string | null;
        results: any[] | null;
        cached: boolean;
        is_casual?: boolean;
        requires_setup?: boolean;
        visualization: {
            type: 'bar' | 'pie' | 'line';
            config: { [key: string]: any };
            data: any[];
        } | null;
    }

    // Main handler for the serverless function
    export default async function (req: VercelRequest, res: VercelResponse) {
        // Set CORS headers for local development and Vercel deployments
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Handle preflight requests (OPTIONS method)
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Only allow POST requests for the main query logic
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        const { question } = req.body as QuestionRequestBody;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        try {
            if (isCasualMessage(question)) {
                console.log(`💬 Casual message detected: ${question}`);
                const casualResponse = await getCasualResponse(question);
                return res.json({
                    answer: casualResponse,
                    sql_query: null,
                    results: null,
                    cached: false,
                    is_casual: true,
                    visualization: null
                } as ApiResponse); // Cast for type safety
            }

            let cachedResult: CachedQueryResult | null = findCachedQuery(question);
            let sqlQuery: string;
            let usedCache: boolean;
            let vizType: 'bar' | 'pie' | 'line' | null = null;
            let vizConfig: { [key: string]: any } | undefined;

            if (cachedResult) {
                console.log(`✓ Using cached query: ${cachedResult.query_id}`);
                sqlQuery = cachedResult.sql;
                usedCache = true;
                vizType = cachedResult.viz_type;
                vizConfig = cachedResult.viz_config;
            } else {
                console.log("✗ No cached query found, using LLM to generate SQL");
                sqlQuery = await generateSqlQueryWithLLM(question);
                usedCache = false;
            }

            console.log(`SQL Query: ${sqlQuery}`);

            let results: any[] | null = null;
            try {
                results = await executeQuery(sqlQuery);
            } catch (dbError: any) {
                console.error("Database execution error:", dbError);
                // Return a structured error response that the frontend can parse
                return res.status(500).json({
                    answer: `⚠️ **Setup Required / Query Error**\n\nIt seems there was an issue executing the query. This might be because the \`execute_sql\` RPC function is not set up correctly in Supabase, or there's an error in the generated SQL.\n\n**Please ensure you have run the \`CREATE FUNCTION execute_sql\` SQL script in your Supabase SQL Editor.**\n\n**The query I wanted to run:**\n\`\`\`sql\n${sqlQuery}\n\`\`\`\n\n**Error details:** ${dbError.message}\n\nAfter setting up the function, please try your question again!`,
                    sql_query: sqlQuery,
                    results: null,
                    cached: usedCache,
                    requires_setup: true,
                    visualization: null
                } as ApiResponse); // Cast for type safety
            }

            const answer = await formatResponseWithLLM(question, sqlQuery, results, usedCache);

            let visualization = null;
            if (vizType && vizConfig && results && results.length > 0) {
                // Ensure numeric values are parsed for Chart.js
                const processedData = results.map(row => {
                    const newRow: { [key: string]: any } = { ...row };
                    // General parsing for specified y_field or value_field
                    if (vizConfig?.y_field && typeof newRow[vizConfig.y_field] === 'string') {
                        newRow[vizConfig.y_field] = parseFloat(newRow[vizConfig.y_field]);
                    }
                    if (vizConfig?.value_field && typeof newRow[vizConfig.value_field] === 'string') {
                        newRow[vizConfig.value_field] = parseFloat(newRow[vizConfig.value_field]);
                    }
                    // Specific parsing for common numeric fields (if they might come as strings from DB)
                    if (newRow.avg_rating !== undefined && typeof newRow.avg_rating === 'string') {
                        newRow.avg_rating = parseFloat(newRow.avg_rating);
                    }
                    if (newRow.roster_percentage !== undefined && typeof newRow.roster_percentage === 'string') {
                        newRow.roster_percentage = parseFloat(newRow.roster_percentage);
                    }
                    // Add more specific parsing as needed for other numeric fields if they come as strings
                    return newRow;
                });

                visualization = {
                    type: vizType,
                    config: vizConfig,
                    data: processedData
                };
            }

            // Return a successful response
            res.json({
                answer,
                sql_query: sqlQuery,
                results,
                cached: usedCache,
                visualization
            } as ApiResponse); // Cast for type safety

        } catch (error: any) {
            console.error("Unhandled error processing query:", error);
            // Catch any unexpected errors that were not handled by dbError above
            res.status(500).json({
                answer: `An unexpected error occurred: ${error.message}. Please check server logs.`,
                sql_query: null,
                results: null,
                cached: false,
                visualization: null
            } as ApiResponse); // Cast for type safety
        }
    }