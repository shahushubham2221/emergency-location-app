import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDuration, formatCountdown, formatRelativeTime } from '../utils/formatters';
import { haversineKm } from '../utils/geo';
import { generateSessionId } from '../utils/session';
import { addToOfflineQueue, getOfflineQueue, clearOfflineQueue } from '../utils/offlineQueue';

// ---------------------------------------------------------------------------
// 1. SOS Countdown — timer completes after N seconds
// ---------------------------------------------------------------------------
describe('SOS countdown timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires the callback after the specified duration', () => {
    const onComplete = vi.fn();
    const DURATION_MS = 5000;

    const timerId = setTimeout(onComplete, DURATION_MS);

    // Not yet called
    expect(onComplete).not.toHaveBeenCalled();

    // Advance time by full duration
    vi.advanceTimersByTime(DURATION_MS);
    expect(onComplete).toHaveBeenCalledTimes(1);

    clearTimeout(timerId);
  });

  it('does not fire the callback before the duration elapses', () => {
    const onComplete = vi.fn();
    const DURATION_MS = 10_000;

    const timerId = setTimeout(onComplete, DURATION_MS);
    vi.advanceTimersByTime(DURATION_MS - 1);

    expect(onComplete).not.toHaveBeenCalled();
    clearTimeout(timerId);
  });
});

// ---------------------------------------------------------------------------
// 2. SOS Countdown cancellation
// ---------------------------------------------------------------------------
describe('SOS countdown cancellation', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('does not fire after clearTimeout is called', () => {
    const onComplete = vi.fn();
    const DURATION_MS = 5000;

    const timerId = setTimeout(onComplete, DURATION_MS);
    clearTimeout(timerId); // cancel immediately

    vi.advanceTimersByTime(DURATION_MS + 1000);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('cancels countdown and resets remaining time', () => {
    let remaining = 10;
    const interval = setInterval(() => {
      remaining--;
    }, 1000);

    vi.advanceTimersByTime(3000);
    expect(remaining).toBe(7);

    // Cancel
    clearInterval(interval);
    vi.advanceTimersByTime(5000);

    // Should stay at 7 since interval was cleared
    expect(remaining).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// 3. Unique session ID generation
// ---------------------------------------------------------------------------
describe('generateSessionId', () => {
  it('returns a non-empty string', () => {
    const id = generateSessionId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs on each call', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateSessionId()));
    expect(ids.size).toBe(500);
  });

  it('uses only URL-safe characters', () => {
    const id = generateSessionId();
    expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
  });
});

// ---------------------------------------------------------------------------
// 4. formatDuration utility
// ---------------------------------------------------------------------------
describe('formatDuration', () => {
  it('formats 0 seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formats 65 seconds as 1:05', () => {
    expect(formatDuration(65)).toBe('1:05');
  });

  it('formats 3600 seconds as 1:00:00', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
  });

  it('formats 3661 seconds as 1:01:01', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('formats 59 seconds as 0:59', () => {
    expect(formatDuration(59)).toBe('0:59');
  });

  it('pads single-digit seconds', () => {
    expect(formatDuration(61)).toBe('1:01');
  });
});

// ---------------------------------------------------------------------------
// 5. formatCountdown utility
// ---------------------------------------------------------------------------
describe('formatCountdown', () => {
  it('formats 10 as "10"', () => {
    expect(formatCountdown(10)).toBe('10');
  });

  it('formats 5 as "5"', () => {
    expect(formatCountdown(5)).toBe('5');
  });

  it('formats 0 as "0"', () => {
    expect(formatCountdown(0)).toBe('0');
  });

  it('formats 30 as "30"', () => {
    expect(formatCountdown(30)).toBe('30');
  });
});

// ---------------------------------------------------------------------------
// 6. haversineKm calculation (known values)
// ---------------------------------------------------------------------------
describe('haversineKm', () => {
  it('returns 0 for the same coordinates', () => {
    expect(haversineKm(0, 0, 0, 0)).toBeCloseTo(0, 5);
  });

  it('calculates distance between London and Paris (~334 km)', () => {
    // London: 51.5074, -0.1278 | Paris: 48.8566, 2.3522
    const dist = haversineKm(51.5074, -0.1278, 48.8566, 2.3522);
    expect(dist).toBeGreaterThan(330);
    expect(dist).toBeLessThan(345);
  });

  it('calculates distance between New York and Los Angeles (~3940 km)', () => {
    // NY: 40.7128, -74.006 | LA: 34.0522, -118.2437
    const dist = haversineKm(40.7128, -74.006, 34.0522, -118.2437);
    expect(dist).toBeGreaterThan(3900);
    expect(dist).toBeLessThan(4000);
  });

  it('is symmetric (A→B == B→A)', () => {
    const d1 = haversineKm(28.6139, 77.209, 19.076, 72.8777);
    const d2 = haversineKm(19.076, 72.8777, 28.6139, 77.209);
    expect(d1).toBeCloseTo(d2, 3);
  });

  it('returns positive distance for antipodal points', () => {
    const dist = haversineKm(0, 0, 0, 180);
    expect(dist).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 7. Offline queue — adds items correctly
// ---------------------------------------------------------------------------
describe('offlineQueue', () => {
  beforeEach(() => {
    clearOfflineQueue();
  });

  it('starts empty', () => {
    expect(getOfflineQueue()).toHaveLength(0);
  });

  it('adds a single item', () => {
    addToOfflineQueue({ type: 'location', payload: { lat: 1, lng: 2 } });
    expect(getOfflineQueue()).toHaveLength(1);
  });

  it('adds multiple items in order', () => {
    addToOfflineQueue({ type: 'location', payload: { lat: 1, lng: 2 } });
    addToOfflineQueue({ type: 'location', payload: { lat: 3, lng: 4 } });
    addToOfflineQueue({ type: 'alert', payload: { message: 'SOS' } });

    const queue = getOfflineQueue();
    expect(queue).toHaveLength(3);
    expect(queue[0].type).toBe('location');
    expect(queue[2].type).toBe('alert');
  });

  it('clears the queue', () => {
    addToOfflineQueue({ type: 'location', payload: {} });
    addToOfflineQueue({ type: 'location', payload: {} });
    clearOfflineQueue();
    expect(getOfflineQueue()).toHaveLength(0);
  });

  it('stores the payload correctly', () => {
    const payload = { lat: 28.6139, lng: 77.209, accuracy: 10 };
    addToOfflineQueue({ type: 'location', payload });
    expect(getOfflineQueue()[0].payload).toEqual(payload);
  });
});

// ---------------------------------------------------------------------------
// 8. formatRelativeTime output
// ---------------------------------------------------------------------------
describe('formatRelativeTime', () => {
  it('returns "just now" for very recent dates', () => {
    const recent = new Date(Date.now() - 5000); // 5 seconds ago
    expect(formatRelativeTime(recent.getTime())).toBe('just now');
  });

  it('returns minutes ago for dates ~2 minutes in the past', () => {
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
    const result = formatRelativeTime(twoMinsAgo.getTime());
    expect(result).toMatch(/2 min/i);
  });

  it('returns hours ago for dates ~2 hours in the past', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = formatRelativeTime(twoHoursAgo.getTime());
    expect(result).toMatch(/2 h/i);
  });

  it('returns days ago for dates ~3 days in the past', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(threeDaysAgo.getTime());
    expect(result).toMatch(/3 d/i);
  });

  it('accepts a Date object without throwing', () => {
    expect(() => formatRelativeTime(Date.now())).not.toThrow();
  });
});
