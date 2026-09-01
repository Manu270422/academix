// Yo cargo aquí (para el compilador de TypeScript) los tipos de los
// matchers extra de Testing Library, de modo que expect(...).toBeInTheDocument()
// no dé error de tipos en los .test.tsx. En tiempo de ejecución los
// engancha src/test/setup.ts.
import '@testing-library/jest-dom/vitest';
