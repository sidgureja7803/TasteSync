import axios from 'axios';

interface GoogleDocsImportData {
  id: string;
  title: string;
  content: string;
}

export async function importFromGoogleDocs(documentId: string, accessToken: string): Promise<GoogleDocsImportData> {
  try {
    // Get document details
    const response = await axios.get(`https://docs.googleapis.com/v1/documents/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const document = response.data;
    
    // Extract title
    const title = document.title || 'Untitled Document';
    
    // Convert document content to markdown
    const content = convertDocumentToMarkdown(document);

    return {
      id: documentId,
      title,
      content,
    };
  } catch (error) {
    console.error('Error importing from Google Docs:', error);
    throw new Error('Failed to import from Google Docs');
  }
}

function convertDocumentToMarkdown(document: any): string {
  let markdown = '';
  
  if (!document.body || !document.body.content) {
    return markdown;
  }
  
  for (const element of document.body.content) {
    if (element.paragraph) {
      markdown += convertParagraphToMarkdown(element.paragraph) + '\n\n';
    } else if (element.sectionBreak) {
      markdown += '---\n\n';
    } else if (element.table) {
      markdown += convertTableToMarkdown(element.table) + '\n\n';
    }
  }
  
  return markdown.trim();
}

function convertParagraphToMarkdown(paragraph: any): string {
  if (!paragraph.elements) {
    return '';
  }
  
  let text = '';
  
  for (const element of paragraph.elements) {
    if (element.textRun) {
      text += convertTextRunToMarkdown(element.textRun);
    } else if (element.inlineObjectElement) {
      text += '[Image]';
    }
  }
  
  // Apply paragraph styles
  if (paragraph.paragraphStyle) {
    const style = paragraph.paragraphStyle;
    
    if (style.headingId) {
      // Handle headings
      if (style.headingId === 'HEADING_1') {
        text = '# ' + text;
      } else if (style.headingId === 'HEADING_2') {
        text = '## ' + text;
      } else if (style.headingId === 'HEADING_3') {
        text = '### ' + text;
      } else if (style.headingId === 'HEADING_4') {
        text = '#### ' + text;
      } else if (style.headingId === 'HEADING_5') {
        text = '##### ' + text;
      } else if (style.headingId === 'HEADING_6') {
        text = '###### ' + text;
      }
    }
    
    // Handle lists
    if (style.indentFirstLine && style.indentFirstLine.magnitude > 0) {
      text = '- ' + text;
    }
  }
  
  return text;
}

function convertTextRunToMarkdown(textRun: any): string {
  let text = textRun.content || '';
  
  if (textRun.textStyle) {
    const style = textRun.textStyle;
    
    if (style.bold) {
      text = `**${text}**`;
    }
    if (style.italic) {
      text = `*${text}*`;
    }
    if (style.strikethrough) {
      text = `~~${text}~~`;
    }
    if (style.underline) {
      text = `<u>${text}</u>`;
    }
    if (style.link) {
      text = `[${text}](${style.link.url})`;
    }
  }
  
  return text;
}

function convertTableToMarkdown(table: any): string {
  let markdown = '';
  
  if (!table.tableRows) {
    return markdown;
  }
  
  for (let i = 0; i < table.tableRows.length; i++) {
    const row = table.tableRows[i];
    let rowText = '|';
    
    if (row.tableCells) {
      for (const cell of row.tableCells) {
        let cellText = '';
        
        if (cell.content) {
          for (const element of cell.content) {
            if (element.paragraph) {
              cellText += convertParagraphToMarkdown(element.paragraph);
            }
          }
        }
        
        rowText += ` ${cellText.trim()} |`;
      }
    }
    
    markdown += rowText + '\n';
    
    // Add header separator for first row
    if (i === 0) {
      const separatorRow = '|' + ' --- |'.repeat(row.tableCells?.length || 0);
      markdown += separatorRow + '\n';
    }
  }
  
  return markdown;
} 