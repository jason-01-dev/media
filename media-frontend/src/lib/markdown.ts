/**
 * Simple markdown to HTML parser for richtext content
 */
export function parseMarkdownToHtml(text: string): string {
  if (!text) return '';

  let html = text;

  // Escape HTML special characters first (but preserve intentional HTML)
  html = html
    .replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore intentional HTML tags
  html = html
    .replace(/&lt;strong&gt;/g, '<strong>')
    .replace(/&lt;\/strong&gt;/g, '</strong>')
    .replace(/&lt;b&gt;/g, '<strong>')
    .replace(/&lt;\/b&gt;/g, '</strong>')
    .replace(/&lt;em&gt;/g, '<em>')
    .replace(/&lt;\/em&gt;/g, '</em>')
    .replace(/&lt;u&gt;/g, '<u>')
    .replace(/&lt;\/u&gt;/g, '</u>')
    .replace(/&lt;i&gt;/g, '<em>')
    .replace(/&lt;\/i&gt;/g, '</em>')
    .replace(/&lt;br&gt;/g, '<br/>')
    .replace(/&lt;br\/&gt;/g, '<br/>')
    .replace(/&lt;p&gt;/g, '<p>')
    .replace(/&lt;\/p&gt;/g, '</p>')
    .replace(/&lt;h1&gt;/g, '<h1>')
    .replace(/&lt;\/h1&gt;/g, '</h1>')
    .replace(/&lt;h2&gt;/g, '<h2>')
    .replace(/&lt;\/h2&gt;/g, '</h2>')
    .replace(/&lt;h3&gt;/g, '<h3>')
    .replace(/&lt;\/h3&gt;/g, '</h3>')
    .replace(/&lt;ul&gt;/g, '<ul>')
    .replace(/&lt;\/ul&gt;/g, '</ul>')
    .replace(/&lt;ol&gt;/g, '<ol>')
    .replace(/&lt;\/ol&gt;/g, '</ol>')
    .replace(/&lt;li&gt;/g, '<li>')
    .replace(/&lt;\/li&gt;/g, '</li>')
    .replace(/&lt;blockquote&gt;/g, '<blockquote>')
    .replace(/&lt;\/blockquote&gt;/g, '</blockquote>');

  // Parse markdown-style bold: **text** => <strong>text</strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Parse markdown-style italic: *text* => <em>text</em>
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Parse markdown-style italic: _text_ => <em>text</em>
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Parse markdown-style underline: __text__ => <u>text</u>
  html = html.replace(/__(.+?)__/g, '<u>$1</u>');

  // Parse markdown headers: # text => <h2>text</h2>, ## text => <h3>text</h3>
  html = html.replace(/^### (.+?)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+?)$/gm, '<h2>$1</h2>');

  // Parse markdown lists: - item => <li>item</li>
  html = html.replace(/^- (.+?)$/gm, '<li>$1</li>');
  // 👈 Correction ici : Remplacement de (<li>.*?<\/li>)/s par (<li>[\s\S]*?<\/li>)
  html = html.replace(/(<li>[\s\S]*?<\/li>)/, '<ul>$1</ul>');

  // Convert newlines to <br/>
  html = html.replace(/\n/g, '<br/>');

  // Fix multiple <br/> from existing HTML tags
  html = html.replace(/<br\/><br\/>/g, '<br/>');

  return html;
}