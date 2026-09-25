interface McpToolDefinition {
  name: string;
  description: string;
  /** Human-facing one-liner (fleet #1967). Optional; consumers fall back to
   *  description. Kept in step with shared/src/types.ts — scripts/lib/
   *  check-inlined-types.mjs reports drift at publish time. */
  summary?: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
    anyOf?: Array<{ required: string[] }>;
    oneOf?: Array<{ required: string[] }>;
    allOf?: Array<{ required: string[] }>;
  };
  outputSchema?: Record<string, unknown>;
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Lorem MCP — placeholder text, generated locally.
 *
 * This used to call loripsum.net. That host no longer resolves, so every call
 * came back 530 (what a Worker fetch to an NXDOMAIN name looks like) and read
 * as a flaky upstream rather than a dead one.
 *
 * There is no replacement to point at, because there was never a reason to
 * make a network call in the first place: lorem ipsum is a fixed Latin word
 * list shuffled into sentences. Generating it here removes the whole failure
 * mode, and answers in microseconds instead of a round trip. The output shape
 * is unchanged, so callers see nothing but the thing starting to work again.
 *
 * Tools:
 * - generate_paragraphs: Generate plain-text lorem ipsum paragraphs
 * - generate_with_options: Generate lorem ipsum HTML with headers, code blocks, and lists
 */


type ParagraphLength = 'short' | 'medium' | 'long' | 'verylong';

const VALID_LENGTHS: ParagraphLength[] = ['short', 'medium', 'long', 'verylong'];

/** Sentences per paragraph, matching loripsum.net's four sizes closely enough. */
const SENTENCES: Record<ParagraphLength, [number, number]> = {
  short: [2, 3],
  medium: [4, 6],
  long: [7, 10],
  verylong: [11, 16],
};

// The standard Cicero-derived word pool every lorem generator draws from.
const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et ' +
  'dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea ' +
  'commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur ' +
  'excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum ' +
  'at vero eos accusamus iusto odio dignissimos ducimus blanditiis praesentium voluptatum deleniti atque ' +
  'corrupti quos dolores quas molestias excepturi occaecati cupiditate provident similique culpa officiis ' +
  'deserunt mollitia animi laborum dolorum fuga harum quidem rerum facilis expedita distinctio nam libero ' +
  'tempore cum soluta nobis eligendi optio cumque nihil impedit quo minus maxime placeat facere possimus ' +
  'omnis assumenda repellendus temporibus autem quibusdam aut officiis debitis necessitatibus saepe eveniet ' +
  'voluptates repudiandae recusandae itaque earum hic tenetur sapiente delectus reiciendis voluptatibus'
).split(' ');

const HEADINGS = [
  'Lorem Ipsum Dolor',
  'Sed Ut Perspiciatis',
  'Nemo Enim Ipsam',
  'Quis Autem Vel',
  'At Vero Eos',
  'Temporibus Autem Quibusdam',
];

const tools: McpToolExport['tools'] = [
  {
    name: 'generate_paragraphs',
    description:
      'Generate placeholder text paragraphs for mockups and layout testing. Returns plain text without formatting.',
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
      'Generate formatted placeholder text with headers, code blocks, and lists (HTML). Specify which elements to include: headers, code blocks, unordered lists, ordered lists.',
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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function between(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function sentence(): string {
  const words: string[] = [];
  const n = between(6, 14);
  for (let i = 0; i < n; i++) words.push(pick(WORDS));
  // A comma somewhere in the middle keeps the rhythm from reading as a list.
  if (n > 9) words[between(3, n - 3)] += ',';
  const text = words.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
}

function paragraph(length: ParagraphLength): string {
  const [min, max] = SENTENCES[length];
  return Array.from({ length: between(min, max) }, sentence).join(' ');
}

function phrase(words: number): string {
  return Array.from({ length: words }, () => pick(WORDS)).join(' ');
}

function generateParagraphs(count: number, length: ParagraphLength) {
  validateArgs(count, length);
  const paragraphs = Array.from({ length: count }, () => paragraph(length));
  return {
    count: paragraphs.length,
    length,
    text: paragraphs.join('\n\n'),
    paragraphs,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function generateWithOptions(
  count: number,
  length: ParagraphLength,
  headers?: boolean,
  code?: boolean,
  unorderedLists?: boolean,
  orderedLists?: boolean,
) {
  validateArgs(count, length);

  const blocks: string[] = [];
  for (let i = 0; i < count; i++) {
    if (headers) {
      const level = between(1, 6);
      blocks.push(`<h${level}>${pick(HEADINGS)}</h${level}>`);
    }
    blocks.push(`<p>${paragraph(length)}</p>`);
    if (code && i % 2 === 0) blocks.push(`<pre><code>${phrase(between(3, 6))}</code></pre>`);
    if (unorderedLists && i % 2 === 0) {
      const items = Array.from({ length: between(3, 5) }, () => `  <li>${phrase(between(3, 7))}</li>`);
      blocks.push(`<ul>\n${items.join('\n')}\n</ul>`);
    }
    if (orderedLists && i % 2 === 1) {
      const items = Array.from({ length: between(3, 5) }, () => `  <li>${phrase(between(3, 7))}</li>`);
      blocks.push(`<ol>\n${items.join('\n')}\n</ol>`);
    }
  }

  const html = blocks.join('\n');
  return {
    count,
    length,
    options: { headers: !!headers, code: !!code, unordered_lists: !!unorderedLists, ordered_lists: !!orderedLists },
    html,
    plain_text: stripHtml(html),
  };
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
