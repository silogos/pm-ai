export * from './graph.js';

/**
 * Production mode is enabled when NODE_ENV is NOT 'developme 
 */ 
export function isProduction(): boolean {
  return process.env.NODE_ENV !== 'development';
}
