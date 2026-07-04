import { describe, it, expect } from 'vitest';
import { parseMarkdown, extractPlainText } from './markdown';

describe('markdown parser utility', () => {
  describe('parseMarkdown', () => {
    it('returns empty string for empty input', () => {
      expect(parseMarkdown('')).toBe('');
    });

    it('parses code blocks', () => {
      const input = '```js\nconst x = 5;\n```';
      const output = parseMarkdown(input);
      expect(output).toContain('<pre><code class="language-js">const x = 5;</code></pre>');
    });

    it('parses inline code', () => {
      const input = 'Use `const` for variables.';
      const output = parseMarkdown(input);
      expect(output).toContain('<code>const</code>');
    });

    it('parses tables', () => {
      const input = `
| Header 1 | Header 2 |
|---|---|
| Value 1 | Value 2 |`;
      const output = parseMarkdown(input);
      expect(output).toContain('<table class="table table-bordered table-striped">');
      expect(output).toContain('<th>Header 1</th>');
      expect(output).toContain('<td>Value 1</td>');
    });

    it('parses lists', () => {
      const input = `- Item 1\n- Item 2`;
      const output = parseMarkdown(input);
      expect(output).toContain('<ul>');
      expect(output).toContain('<li>Item 1</li>');
      expect(output).toContain('<li>Item 2</li>');
      expect(output).toContain('</ul>');
    });

    it('wraps paragraphs', () => {
      const input = 'Hello World\n\nThis is paragraph 2.';
      const output = parseMarkdown(input);
      expect(output).toContain('<p>Hello World</p>');
      expect(output).toContain('<p>This is paragraph 2.</p>');
    });
  });

  describe('extractPlainText', () => {
    it('strips HTML tags in browser environment', () => {
      const html = '<div>Hello <strong>World</strong></div>';
      const text = extractPlainText(html);
      expect(text).toBe('Hello World');
    });

    it('handles DOMParser errors by falling back to regex', () => {
      const originalDOMParser = window.DOMParser;
      delete (window as any).DOMParser;
      
      const html = '<p>Hello World</p>';
      const text = extractPlainText(html);
      expect(text).toBe('Hello World');
      
      window.DOMParser = originalDOMParser;
    });
  });
});
