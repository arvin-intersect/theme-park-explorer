/**
 * Parses markdown tables from a given text and converts them to HTML tables.
 * This should be called before other markdown parsing to avoid issues with line breaks.
 */
function parseMarkdownTables(text: string): string {
    const lines = text.split('\n');
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Check if this line looks like a table header (contains |)
        if (line.includes('|') && line.trim().startsWith('|')) {
            // Check if next line is a separator line (e.g., |---|---|)
            if (i + 1 < lines.length && lines[i + 1].match(/^\|[\s\-:|]+\|/)) {
                // This is a table!
                const tableLines = [line, lines[i + 1]];
                i += 2; // Move past header and separator

                // Collect all table rows
                while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
                    tableLines.push(lines[i]);
                    i++;
                }

                // Convert to HTML table
                result.push(convertToHtmlTable(tableLines));
                continue; // Continue from where table parsing left off
            }
        }

        result.push(line);
        i++;
    }

    return result.join('\n');
}

/**
 * Converts an array of markdown table lines into an HTML table string.
 */
function convertToHtmlTable(tableLines: string[]): string {
    let html = '<table class="min-w-full divide-y divide-border border rounded-md shadow-sm">'; // Added Tailwind classes
    const headerCells = tableLines[0].split('|').filter(cell => cell.trim() !== '');

    // Header
    html += '<thead class="bg-muted/50"><tr class="text-left">'; // Added Tailwind classes
    headerCells.forEach(cell => {
        html += `<th class="px-4 py-2 text-sm font-semibold text-muted-foreground">${cell.trim()}</th>`; // Added Tailwind classes
    });
    html += '</tr></thead>';

    // Body (skip separator line, starts from index 2)
    html += '<tbody class="divide-y divide-border">'; // Added Tailwind classes
    for (let i = 2; i < tableLines.length; i++) {
        const cells = tableLines[i].split('|').filter(cell => cell.trim() !== '');
        html += `<tr class="hover:bg-muted/20">`; // Added Tailwind classes
        cells.forEach(cell => {
            html += `<td class="px-4 py-2 text-sm text-foreground">${cell.trim()}</td>`; // Added Tailwind classes
        });
        html += '</tr>';
    }
    html += '</tbody>';

    html += '</table>';
    return html;
}

/**
 * Parses a markdown string and converts it to HTML.
 * Supports bold, italic, lists, code blocks, and tables (via parseMarkdownTables).
 */
export function parseMarkdown(text: string): string {
    // 1. Parse tables first
    let html = parseMarkdownTables(text);

    // 2. Code blocks (multi-line) - Important to do before other line-based parsing
    html = html.replace(/```(\w+)?\n([\s\S]+?)\n```/g, '<pre class="bg-muted border p-2 rounded-md my-2 overflow-x-auto text-xs"><code class="language-$1">$2</code></pre>');

    // 3. Inline code
    html = html.replace(/`([^`]+?)`/g, '<code class="bg-muted/50 px-1 py-0.5 rounded text-xs font-mono">$1</code>');

    // 4. Bold text: **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // 5. Italic text: *text* or _text_ (but not when part of ** or __)
    // Positive lookbehind/lookahead to prevent matching inside bold markers
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');

    // 6. Headings (simple h2, h3 - can be expanded)
    html = html.replace(/^##\s*(.+)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>');
    html = html.replace(/^###\s*(.+)$/gm, '<h3 class="text-lg font-semibold mt-3 mb-1">$1</h3>');

    // 7. Unordered lists: lines starting with * or -
    html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> elements in <ul>
    // This regex looks for one or more <li> followed by an optional <br> and captures them
    html = html.replace(/(<li>.*?<\/li>(?:<br>)?)+/gs, function(match) {
        // Remove <br> tags within the list context if they're not separating logical list items
        const cleaned = match.replace(/<br>\s*(<li>)/g, '$1').replace(/<br>$/g, '');
        return '<ul class="list-disc list-inside space-y-1 my-2">' + cleaned + '</ul>'; // Added Tailwind classes
    });


    // 8. Ordered lists: lines starting with 1. 2. etc
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> elements in <ol>
    html = html.replace(/(<li>.*?<\/li>(?:<br>)?)+/gs, function(match) {
        // Only wrap if it looks like a numbered list and not already part of an unordered list
        if (!match.includes('list-disc') && match.match(/^\s*<li>\d+\./)) {
            const cleaned = match.replace(/<br>\s*(<li>)/g, '$1').replace(/<br>$/g, '');
            return '<ol class="list-decimal list-inside space-y-1 my-2">' + cleaned + '</ol>'; // Added Tailwind classes
        }
        return match; // Return as is if already processed or not a numbered list
    });

    // 9. Blockquotes
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 py-1 italic text-muted-foreground my-2">$1</blockquote>');

    // 10. Horizontal rule
    html = html.replace(/^[-\*\_]{3,}$/gm, '<hr class="my-4 border-t border-border/50">');


    // 11. Final line breaks (remaining single newlines not part of other blocks become <br>)
    html = html.replace(/\n/g, '<br>');


    return html;
}