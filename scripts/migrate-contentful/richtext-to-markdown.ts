import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import type {
  Block,
  Document,
  Hyperlink,
  Inline,
  Paragraph,
  Quote,
  Text,
} from '@contentful/rich-text-types';
import { extForAsset } from './download-assets';

export type AssetRef = {
  url: string;
  filename: string;
  title: string;
};

type Ctx = {
  slug: string;
  assets: AssetRef[];
  embedCounter: number;
  warnings: string[];
};

export type ConvertResult = {
  markdown: string;
  assets: AssetRef[];
  warnings: string[];
};

export function convertRichTextToMarkdown(doc: Document, slug: string): ConvertResult {
  const ctx: Ctx = { slug, assets: [], embedCounter: 0, warnings: [] };
  const md = doc.content.map((node) => convertBlock(node as Block, ctx)).join('');
  return { markdown: md.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', assets: ctx.assets, warnings: ctx.warnings };
}

function convertBlock(node: Block, ctx: Ctx): string {
  switch (node.nodeType) {
    case BLOCKS.HEADING_1:
      return `### ${renderInline(node.content, ctx)}\n\n`;
    case BLOCKS.HEADING_2:
      return `#### ${renderInline(node.content, ctx)}\n\n`;
    case BLOCKS.HEADING_3:
      return `##### ${renderInline(node.content, ctx)}\n\n`;
    case BLOCKS.HEADING_4:
      return `###### ${renderInline(node.content, ctx)}\n\n`;
    case BLOCKS.HEADING_5:
    case BLOCKS.HEADING_6:
      throw new Error(`[${ctx.slug}] H5/H6 is not supported (appeared in content)`);
    case BLOCKS.PARAGRAPH:
      return convertParagraph(node as Paragraph, ctx);
    case BLOCKS.UL_LIST:
      return convertList(node, ctx, 'ul', 0);
    case BLOCKS.OL_LIST:
      return convertList(node, ctx, 'ol', 0);
    case BLOCKS.QUOTE:
      return convertQuote(node as Quote, ctx);
    case BLOCKS.HR:
      return `---\n\n`;
    case BLOCKS.EMBEDDED_ASSET:
      return convertEmbeddedAsset(node, ctx);
    case BLOCKS.EMBEDDED_ENTRY:
      ctx.warnings.push('EMBEDDED_ENTRY encountered; skipped');
      return '';
    case BLOCKS.TABLE:
      return convertTable(node, ctx);
    default:
      ctx.warnings.push(`Unknown block nodeType: ${node.nodeType}`);
      return '';
  }
}

function convertParagraph(node: Paragraph, ctx: Ctx): string {
  if (
    node.content.length === 1 &&
    node.content[0].nodeType === 'text' &&
    (node.content[0] as Text).marks.some((m) => m.type === MARKS.CODE)
  ) {
    const value = (node.content[0] as Text).value;
    return `\`\`\`\n${value.replace(/\n$/, '')}\n\`\`\`\n\n`;
  }
  const rendered = renderInline(node.content, ctx);
  if (rendered.trim() === '') return '';
  return `${escapeLeadingMarker(rendered)}\n\n`;
}

function escapeLeadingMarker(s: string): string {
  return s.replace(/^(#{1,6}\s|-\s|\*\s|\+\s|\d+\.\s|>\s)/, (m) => `\\${m}`);
}

type ListNode = { content: Array<{ content: Block[] }> };

function convertList(node: unknown, ctx: Ctx, kind: 'ul' | 'ol', depth: number): string {
  const list = node as ListNode;
  const indent = '  '.repeat(depth);
  let out = '';
  list.content.forEach((li, idx) => {
    const marker = kind === 'ol' ? `${idx + 1}.` : '-';
    const lines: string[] = [];
    for (const child of li.content) {
      if (child.nodeType === BLOCKS.PARAGRAPH) {
        const p = child as Paragraph;
        lines.push(renderInline(p.content, ctx));
      } else if (child.nodeType === BLOCKS.UL_LIST) {
        lines.push('\n' + convertList(child, ctx, 'ul', depth + 1).trimEnd());
      } else if (child.nodeType === BLOCKS.OL_LIST) {
        lines.push('\n' + convertList(child, ctx, 'ol', depth + 1).trimEnd());
      } else {
        lines.push(convertBlock(child, ctx).trimEnd());
      }
    }
    out += `${indent}${marker} ${lines.join('')}\n`;
  });
  return depth === 0 ? out + '\n' : out;
}

function convertQuote(node: Quote, ctx: Ctx): string {
  const inner = node.content.map((c) => convertBlock(c as Block, ctx)).join('');
  const lines = inner.trimEnd().split('\n');
  return lines.map((l) => (l === '' ? '>' : `> ${l}`)).join('\n') + '\n\n';
}

type EmbeddedAssetNode = {
  data: {
    target: {
      fields: {
        title?: string;
        file: {
          url: string;
          fileName?: string;
          contentType?: string;
        };
      };
    };
  };
};

function convertEmbeddedAsset(node: unknown, ctx: Ctx): string {
  const target = (node as EmbeddedAssetNode).data?.target;
  if (!target?.fields?.file) {
    ctx.warnings.push('EMBEDDED_ASSET missing file data');
    return '';
  }
  ctx.embedCounter += 1;
  const idx = String(ctx.embedCounter).padStart(3, '0');
  const ext = extForAsset(target.fields.file.contentType, target.fields.file.url);
  const filename = `embed-${idx}.${ext}`;
  const url = 'https:' + target.fields.file.url;
  const title = (target.fields.title ?? target.fields.file.fileName ?? '').toString();
  ctx.assets.push({ url, filename, title });
  const alt = escapeAlt(title);
  return `![${alt}](./images/${filename})\n\n`;
}

type TableNode = {
  content: Array<{
    nodeType: string;
    content: Array<{ nodeType: string; content: Array<Block | Inline | Text> }>;
  }>;
};

function convertTable(node: unknown, ctx: Ctx): string {
  const table = node as TableNode;
  const rows: string[][] = [];
  for (const row of table.content) {
    const cells: string[] = [];
    for (const cell of row.content) {
      const cellText = cell.content
        .map((c) => {
          if (c.nodeType === BLOCKS.PARAGRAPH) {
            return renderInline((c as Paragraph).content, ctx);
          }
          return convertBlock(c as Block, ctx).trim();
        })
        .join(' ')
        .replace(/\n+/g, ' ')
        .replace(/\|/g, '\\|');
      cells.push(cellText);
    }
    rows.push(cells);
  }
  if (rows.length === 0) return '';
  const width = Math.max(...rows.map((r) => r.length));
  for (const r of rows) while (r.length < width) r.push('');
  const lines: string[] = [];
  lines.push('| ' + rows[0].join(' | ') + ' |');
  lines.push('| ' + rows[0].map(() => '---').join(' | ') + ' |');
  for (let i = 1; i < rows.length; i++) {
    lines.push('| ' + rows[i].join(' | ') + ' |');
  }
  return lines.join('\n') + '\n\n';
}

function renderInline(nodes: Array<Inline | Text | Block>, ctx: Ctx): string {
  return nodes.map((n) => renderInlineNode(n, ctx)).join('');
}

function renderInlineNode(node: Inline | Text | Block, ctx: Ctx): string {
  if (node.nodeType === 'text') {
    return applyMarks(node as Text);
  }
  if (node.nodeType === INLINES.HYPERLINK) {
    const h = node as Hyperlink;
    const text = renderInline(h.content, ctx);
    return `[${text}](${h.data.uri})`;
  }
  if (node.nodeType === INLINES.ENTRY_HYPERLINK) {
    type EntryHyperlink = { content: Array<Inline | Text>; data: { target?: { fields?: { slug?: string } } } };
    const e = node as unknown as EntryHyperlink;
    const text = renderInline(e.content, ctx);
    const targetSlug = e.data?.target?.fields?.slug;
    if (!targetSlug) {
      ctx.warnings.push('ENTRY_HYPERLINK missing target slug');
      return text;
    }
    return `[${text}](/post/${targetSlug})`;
  }
  if (node.nodeType === INLINES.ASSET_HYPERLINK) {
    type AssetHyperlink = {
      content: Array<Inline | Text>;
      data: { target?: { fields?: { file?: { url?: string } } } };
    };
    const a = node as unknown as AssetHyperlink;
    const text = renderInline(a.content, ctx);
    const url = a.data?.target?.fields?.file?.url;
    if (!url) {
      ctx.warnings.push('ASSET_HYPERLINK missing url');
      return text;
    }
    return `[${text}](https:${url})`;
  }
  if (node.nodeType === INLINES.EMBEDDED_ENTRY) {
    ctx.warnings.push('inline EMBEDDED_ENTRY encountered; skipped');
    return '';
  }
  ctx.warnings.push(`Unknown inline nodeType: ${(node as { nodeType: string }).nodeType}`);
  return '';
}

function applyMarks(text: Text): string {
  const hasCode = text.marks.some((m) => m.type === MARKS.CODE);
  let v: string;
  if (hasCode) {
    const raw = text.value;
    const needsDouble = raw.includes('`');
    const fence = needsDouble ? '`` ' : '`';
    const trailing = needsDouble ? ' ``' : '`';
    v = `${fence}${raw}${trailing}`;
  } else {
    v = escapeInline(text.value);
  }
  for (const mark of text.marks) {
    if (mark.type === MARKS.BOLD) v = `**${v}**`;
    else if (mark.type === MARKS.ITALIC) v = `*${v}*`;
    else if (mark.type === MARKS.UNDERLINE) v = `<u>${v}</u>`;
  }
  return v;
}

function escapeInline(s: string): string {
  return s.replace(/([\\`*_\[\]<>])/g, '\\$1');
}

function escapeAlt(s: string): string {
  return s.replace(/[\[\]]/g, '');
}
