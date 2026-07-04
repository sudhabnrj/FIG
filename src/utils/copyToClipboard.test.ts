import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from './copyToClipboard';

describe('copyToClipboard utility', () => {
  let onSuccess: () => void;

  beforeEach(() => {
    onSuccess = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does nothing when window is undefined', () => {
    const originalWindow = globalThis.window;
    // @ts-ignore
    delete globalThis.window;

    copyToClipboard('hello', onSuccess);
    expect(onSuccess).not.toHaveBeenCalled();

    globalThis.window = originalWindow;
  });

  it('logs error for empty/invalid text', () => {
    copyToClipboard('', onSuccess);
    expect(console.error).toHaveBeenCalledWith('Invalid content provided for clipboard copy');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('uses navigator.clipboard when available', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    
    // Inherit from current navigator to preserve other properties (like userAgent)
    const customNavigator = Object.create(globalThis.navigator);
    customNavigator.clipboard = {
      writeText: writeTextSpy,
    };
    vi.stubGlobal('navigator', customNavigator);

    copyToClipboard('test copy', onSuccess);
    
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(writeTextSpy).toHaveBeenCalledWith('test copy');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('falls back to document.execCommand if clipboard throws', async () => {
    const writeTextSpy = vi.fn().mockRejectedValue(new Error('Permission denied'));
    
    // Inherit from current navigator to preserve other properties (like userAgent)
    const customNavigator = Object.create(globalThis.navigator);
    customNavigator.clipboard = {
      writeText: writeTextSpy,
    };
    vi.stubGlobal('navigator', customNavigator);

    const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);

    copyToClipboard('fallback copy', onSuccess);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(execCommandSpy).toHaveBeenCalledWith('copy');
    expect(onSuccess).toHaveBeenCalled();
  });
});
