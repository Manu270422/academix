// ============================================================
// SETUP DE LOS TESTS DEL BACKEND
// ============================================================
// Fuerzo NODE_ENV=test antes de que se cargue cualquier modulo que
// lea la configuracion. Asi el errorHandler no filtra stacktraces y
// uso siempre los valores por defecto de config/env.ts.
// ============================================================

process.env.NODE_ENV = 'test';
// Secretos JWT deterministas para los tests (no son secretos reales).
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
