/**
 * Lorem MCP — wraps loripsum.net (free, no auth)
 *
 * Tools:
 * - generate_paragraphs: Generate plain-text lorem ipsum paragraphs
 * - generate_with_options: Generate lorem ipsum HTML with headers, code blocks, and lists
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://loripsum.net/api';

type ParagraphLength = 'short' | 'medium' | 'long' | 'verylong';

const VALID_LENGTHS: ParagraphLength[] = ['short', 'medium', 'long', 'verylong'];

const tools: McpToolExport['tools'] = [
  {
    name: 'generate_paragraphs',
    description:
      'Generate lorem ipsum placeholder text as plain paragraphs. Strips all HTML tags from the response.',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of paragraphs to generate (1–10)',
        },
        length: {
          type: 'string',
          enum: ['short', 'medium', 'long', 'verylong'],
          description: 'Length of each paragraph: short, medium, long, or verylong',
        },
      },
      required: ['count', 'length'],
    },
  },
  {
    name: 'generate_with_options',
    description:
      'Generate lorem ipsum HTML with optional headers, code blocks, unordered lists, and ordered lists.',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of paragraphs to generate (1–10)',
        },
        length: {
          type: 'string',
          enum: ['short', 'medium', 'long', 'verylong'],
          description: 'Length of each paragraph',
        },
        headers: {
          type: 'boolean',
          description: 'Include random headers (h1–h6)',
        },
        code: {
          type: 'boolean',
          description: 'Include code blocks',
        },
        unordered_lists: {
          type: 'boolean',
          description: 'Include unordered (bullet) lists',
        },
        ordered_lists: {
          type: 'boolean',
          description: 'Include ordered (numbered) lists',
        },
      },
      required: ['count', 'length'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'generate_paragraphs':
      return generateParagraphs(args.count as number, args.length as ParagraphLength);
    case 'generate_with_options':
      return generateWithOptions(
        args.count as number,
        args.length as ParagraphLength,
        args.headers as boolean | undefined,
        args.code as boolean | undefined,
        args.unordered_lists as boolean | undefined,
        args.ordered_lists as boolean | undefined,
      );
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function validateArgs(count: number, length: string) {
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    throw new Error('count must be an integer between 1 and 10');
  }
  if (!VALID_LENGTHS.includes(length as ParagraphLength)) {
    throw new Error(`length must be one of: ${VALID_LENGTHS.join(', ')}`);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function generateParagraphs(count: number, length: ParagraphLength) {
  validateArgs(count, length);
  const res = await fetch(`${BASE_URL}/${count}/${length}/plaintext`);
  if (!res.ok) throw new Error(`loripsum.net error: ${res.status}`);
  const text = await res.text();
  const paragraphs = text.trim().split(/\n\n+/).filter(Boolean);
  return {
    count: paragraphs.length,
    length,
    text: text.trim(),
    paragraphs,
  };
}

async function generateWithOptions(
  count: number,
  length: ParagraphLength,
  headers?: boolean,
  code?: boolean,
  unorderedLists?: boolean,
  orderedLists?: boolean,
) {
  validateArgs(count, length);

  const segments = [String(count), length];
  if (headers) segments.push('headers');
  if (code) segments.push('code');
  if (unorderedLists) segments.push('ul');
  if (orderedLists) segments.push('ol');

  const url = `${BASE_URL}/${segments.join('/')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`loripsum.net error: ${res.status}`);

  const html = await res.text();
  return {
    count,
    length,
    options: { headers: !!headers, code: !!code, unordered_lists: !!unorderedLists, ordered_lists: !!orderedLists },
    html: html.trim(),
    plain_text: stripHtml(html),
  };
}

export default { tools, callTool } satisfies McpToolExport;
