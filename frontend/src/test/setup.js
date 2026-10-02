import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup após cada teste
afterEach(() => {
  cleanup();
});
