import { describe, it, expect, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce utility', () => {
  it('should debounce function calls', () => {
    vi.useFakeTimers();
    const func = vi.fn();
    const debounced = debounce(func, 100);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith('c');
    
    vi.useRealTimers();
  });
});
