export const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  // 1. Code blocks
  let html = text.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
  });
  
  // 2. Inline code snippets
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  
  // 3. Markdown Tables converter
  html = html.replace(/(?:^|\n)(\|.*\|(?:\n\|.*\|)*)/g, (match, tableText) => {
    const rows = tableText.trim().split('\n');
    if (rows.length < 2) return match;
    
    let tableHtml = '<div class="table-responsive"><table class="table table-bordered table-striped">';
    let hasHeader = false;
    
    rows.forEach((row: string, rIdx: number) => {
      if (row.includes('---')) {
        hasHeader = true;
        return;
      }
      
      const cols = row.split('|')
        .map(c => c.trim())
        .filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1);
      
      if (rIdx === 0 && !hasHeader) {
        tableHtml += '<thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
      } else {
        if (rIdx === 2 && hasHeader) {
          tableHtml += '<tbody>';
        }
        tableHtml += '<tr>' + cols.map(c => `<td>${c}</td>`).join('') + '</tr>';
      }
    });
    
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });
  
  // 4. Convert bullet points
  let inList = false;
  const lines = html.split('\n');
  const processedLines: string[] = [];
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    const listMatch = trimmed.match(/^([-\*●])\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${listMatch[2]}</li>`); // Wait, let's keep it as listMatch[2] without the "> "! Let's check original.
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  });
  if (inList) {
    processedLines.push('</ul>');
  }
  html = processedLines.join('\n');
  
  // 5. Wrap paragraph blocks
  const blocks = html.split(/\n\n+/);
  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<pre') || trimmed.startsWith('<div class="table') || trimmed.startsWith('<ul>') || trimmed.startsWith('<ol>')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });
  
  return formattedBlocks.join('\n');
};

export const extractPlainText = (htmlContent: string): string => {
  if (typeof window === 'undefined') {
    return htmlContent.replace(/<[^>]*>/g, '');
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    return doc.body.textContent || doc.body.innerText || '';
  } catch (err) {
    console.error('Failed to extract plain text:', err);
    return htmlContent.replace(/<[^>]*>/g, '');
  }
};
