import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Polyfill DOMParser for Node/jsdom testing environment
if (typeof window !== 'undefined') {
  global.DOMParser = window.DOMParser;
  // Polyfill execCommand on document
  document.execCommand = vi.fn();
}

// Polyfill window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Polyfill window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

// Polyfill navigator.clipboard safely by inheriting from existing navigator
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue(''),
};

try {
  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
    configurable: true,
  });
} catch (e) {
  // Fallback if property is read-only and non-configurable in jsdom
  const originalNavigator = globalThis.navigator;
  const customNavigator = Object.create(originalNavigator);
  customNavigator.clipboard = mockClipboard;
  
  // Use Object.defineProperty to override globalThis.navigator
  Object.defineProperty(globalThis, 'navigator', {
    value: customNavigator,
    writable: true,
    configurable: true,
  });
}
