// arvin-intersect-theme-park-explorer/src/api/lib/aiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DB_SCHEMA, CACHED_QUERIES, CachedQueryResult } from "./constants.js";
import { compareTwoStrings } from 'string-similarity';

// Initialize Gemini AI
// Ensure GEMINI_API_KEY is available in the environment (e.g., .env file or Vercel env vars)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export function findCachedQuery(question: string): CachedQueryResult | null {
    const questionLower = question.toLowerCase();

    // 1. Direct pattern matching
    for (const queryId in CACHED_QUERIES) {
        const queryData = CACHED_QUERIES[queryId];
        for (const pattern of queryData.patterns) {
            if (questionLower.includes(pattern.toLowerCase())) {
                return { ...queryData, query_id: queryId, cached: true };
            }
        }
    }

    // 2. Fuzzy matching on descriptions
    const descriptions: { id: string; text: string }[] = [];
    for (const queryId in CACHED_QUERIES) {
        descriptions.push({ id: queryId, text: CACHED_QUERIES[queryId].description.toLowerCase() });
    }

    let bestMatch: { id: string; score: number } | null = null;
    for (const desc of descriptions) {
        const score = compareTwoStrings(questionLower, desc.text);
        if (score > 0.7 && (!bestMatch || score > bestMatch.score)) { // Tunable cutoff
            bestMatch = { id: desc.id, score };
        }
    }

    if (bestMatch) {
        const queryData = CACHED_QUERIES[bestMatch.id];
        console.log(`Fuzzy match found for ${questionLower}: ${queryData.description} (score: ${bestMatch.score.toFixed(2)})`);
        return { ...queryData, query_id: bestMatch.id, cached: true };
    }

    return null;
}

function generateCachedExamplesForLLM(): string {
    let examples = "Here are several pre-validated example queries for reference:\n\n";
    for (const queryId in CACHED_QUERIES) {
        const queryData = CACHED_QUERIES[queryId];
        examples += `${queryId}. ${queryData.description}\n`;
        examples += `   SQL: ${queryData.sql}\n\n`;
    }
    return examples;
}

export async function generateSqlQueryWithLLM(question: string): Promise<string> {
    const examples = generateCachedExamplesForLLM();

    const prompt = `You are a SQL expert for the Peakville Amusement Park database. Convert the following natural language question into a valid PostgreSQL query for the given database schema.

${DB_SCHEMA}

${examples}

IMPORTANT RULES:
1. Always use double quotes for table names, column names, and RPC function arguments if they contain spaces or special characters (e.g., "full_name", "start_time"). However, the main table names like \`profiles\`, \`departments\`, \`zones\` generally don't need quotes if they are single words and lowercase. When specifying RPC functions, call them as \`get_function_name('arg1', 'arg2')\`.
2. For RPC functions like \`get_daily_department_health\`, call them as \`SELECT * FROM get_daily_department_health('YYYY-MM-DD')\`.
3. For date comparisons or extraction from \`timestamp with time zone\` columns (like \`start_time\`), use \`DATE_TRUNC\`, \`EXTRACT\` or \`TO_CHAR\` functions. For \`date\` columns (like \`daily_visitor_predictions.date\`), you can compare directly with date strings.
4. When dealing with \`date\` fields, assume '2024-01-01' as the reference date for 'today' or 'current day' due to the mock data pattern.
5. Return ONLY the SQL query, no explanations or markdown.
6. Do not include semicolon at the end.
7. Follow the patterns from the examples above for similar queries.
8. Add LIMIT clause for queries that might return too many rows (e.g., more than 20-30 rows).

User Question: ${question}

SQL Query:`;

    const result = await model.generateContent(prompt);
    let sqlQuery = result.response.text().trim();
    sqlQuery = sqlQuery.replace(/```sql/g, "").replace(/```/g, "").trim();
    sqlQuery = sqlQuery.replace(/;$/, ""); // Remove trailing semicolon

    return sqlQuery;
}

export async function formatResponseWithLLM(question: string, sqlQuery: string, results: any, cached: boolean = false): Promise<string> {
    const cacheNote = cached ? " (Retrieved from cache)" : "";

    const prompt = `You are a helpful data analyst for Peakville Amusement Park. The user asked: "${question}"

The SQL query executed was${cacheNote}:
${sqlQuery}

The results are:
${JSON.stringify(results, null, 2)}

Provide a clear, concise, and friendly answer to the user's question based on these results.
- Format numbers nicely (use commas for thousands, limit decimals to 1-2 places for ratings/percentages).
- If there are multiple results, present them in a readable list or table-like format.
- If results are empty, state that no data was found.
- For date-related queries where a fixed date '2024-01-01' was used due to mock data, mention this context.
- Start your answer directly, without a greeting.

Answer:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}

export function isCasualMessage(question: string): boolean {
    const casualPatterns = [
        "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
        "how are you", "what's up", "whats up", "sup", "yo",
        "thanks", "thank you", "bye", "goodbye", "see you",
        "who are you", "what can you do", "help", "what is this",
        "how do i", "can you help", "nice", "cool", "awesome",
        "ok", "okay", "sure", "yes", "no", "maybe",
        "tell me about the park", "what data do you have", "what can you show me"
    ];

    const questionLower = question.toLowerCase().trim();

    if (questionLower.split(' ').length <= 8) {
        for (const pattern of casualPatterns) {
            if (questionLower.includes(pattern)) {
                return true;
            }
        }
    }

    const systemQuestions = [
        "what can you do",
        "how do you work",
        "who created you",
        "what is this",
        "help me",
        "about peakville"
    ];

    for (const sq of systemQuestions) {
        if (questionLower.includes(sq)) {
            return true;
        }
    }

    return false;
}

export async function getCasualResponse(question: string): Promise<string> {
    const prompt = `You are a friendly AI assistant for the Peakville Amusement Park CRM system.
The user said: "${question}"

This is casual conversation, not a data query. Respond naturally and helpfully.

If they're greeting you, greet them back warmly and mention you can help them analyze their Peakville Park operational data.
If they're asking what you can do, explain you can answer questions about employees, departments, zones, attractions, shifts, performance, and visitor predictions from the Peakville Park dataset. You can provide both text answers and interactive charts.
If they're thanking you, respond graciously.
If they're saying goodbye, wish them well.
If they ask about the park, give a brief, exciting overview.

Keep it brief, friendly, and natural.

Response:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}