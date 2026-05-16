import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup();
});

// Mock PocketBase
vi.mock('../utils/pocketBaseClient', () => ({
  loadPocketBase: vi.fn().mockResolvedValue({
    authStore: {
      isValid: false,
      token: '',
      model: null,
      onChange: vi.fn(),
      clear: vi.fn(),
    },
    collection: vi.fn().mockReturnThis(),
    getFullList: vi.fn().mockResolvedValue([]),
    authWithPassword: vi.fn().mockResolvedValue({}),
  }),
  getLoadedPocketBase: vi.fn().mockReturnValue(null),
}));

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
