import axios from 'axios';

interface NotionImportData {
  id: string;
  title: string;
  content: string;
}

export async function importFromNotion(url: string, accessToken: string): Promise<NotionImportData> {
  try {
    // Extract page ID from Notion URL
    const pageId = extractPageIdFromUrl(url);
    
    if (!pageId) {
      throw new Error('Invalid Notion URL');
    }

    // Get page details
    const pageResponse = await axios.get(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });

    // Get page content (blocks)
    const blocksResponse = await axios.get(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });

    // Extract title
    const title = extractTitle(pageResponse.data);
    
    // Convert blocks to markdown
    const content = convertBlocksToMarkdown(blocksResponse.data.results);

    return {
      id: pageId,
      title,
      content,
    };
  } catch (error) {
    console.error('Error importing from Notion:', error);
    throw new Error('Failed to import from Notion');
  }
}

function extractPageIdFromUrl(url: string): string | null {
  const match = url.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
  return match ? match[0].replace(/-/g, '') : null;
}

function extractTitle(page: any): string {
  const properties = page.properties;
  
  // Look for title property
  const titleProperty = Object.values(properties).find((prop: any) => prop.type === 'title');
  
  if (titleProperty && (titleProperty as any).title.length > 0) {
    return (titleProperty as any).title[0].plain_text;
  }
  
  return 'Untitled';
}

function convertBlocksToMarkdown(blocks: any[]): string {
  let markdown = '';
  
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        markdown += extractRichText(block.paragraph.rich_text) + '\n\n';
        break;
      case 'heading_1':
        markdown += '# ' + extractRichText(block.heading_1.rich_text) + '\n\n';
        break;
      case 'heading_2':
        markdown += '## ' + extractRichText(block.heading_2.rich_text) + '\n\n';
        break;
      case 'heading_3':
        markdown += '### ' + extractRichText(block.heading_3.rich_text) + '\n\n';
        break;
      case 'bulleted_list_item':
        markdown += '- ' + extractRichText(block.bulleted_list_item.rich_text) + '\n';
        break;
      case 'numbered_list_item':
        markdown += '1. ' + extractRichText(block.numbered_list_item.rich_text) + '\n';
        break;
      case 'quote':
        markdown += '> ' + extractRichText(block.quote.rich_text) + '\n\n';
        break;
      case 'code':
        markdown += '```' + (block.code.language || '') + '\n' + extractRichText(block.code.rich_text) + '\n```\n\n';
        break;
      case 'divider':
        markdown += '---\n\n';
        break;
      default:
        // Handle other block types or skip
        break;
    }
  }
  
  return markdown.trim();
}

function extractRichText(richText: any[]): string {
  if (!richText || richText.length === 0) {
    return '';
  }
  
  return richText.map(text => {
    let content = text.plain_text;
    
    if (text.annotations?.bold) {
      content = `**${content}**`;
    }
    if (text.annotations?.italic) {
      content = `*${content}*`;
    }
    if (text.annotations?.strikethrough) {
      content = `~~${content}~~`;
    }
    if (text.annotations?.code) {
      content = `\`${content}\``;
    }
    if (text.href) {
      content = `[${content}](${text.href})`;
    }
    
    return content;
  }).join('');
} 