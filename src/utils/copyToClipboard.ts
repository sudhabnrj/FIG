export const copyToClipboard = (text: string, onSuccess: () => void) => {
  if (typeof window === 'undefined') return;

  if (typeof text !== 'string' || !text.trim()) {
    console.error('Invalid content provided for clipboard copy');
    return;
  }

  // Safe bounds check to protect clipboard space
  const safeText = text.slice(0, 10000);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(safeText)
      .then(() => {
        onSuccess();
      })
      .catch((err) => {
        console.error('Clipboard write error: ', err);
        fallbackCopyToClipboard(safeText, onSuccess);
      });
  } else {
    fallbackCopyToClipboard(safeText, onSuccess);
  }
};

const fallbackCopyToClipboard = (text: string, onSuccess: () => void) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      onSuccess();
    } else {
      console.error('Fallback copy command failed');
    }
  } catch (err) {
    console.error('Fallback copy error: ', err);
  }
  document.body.removeChild(textArea);
};
