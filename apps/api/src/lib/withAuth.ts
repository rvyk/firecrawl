import { configDotenv } from "dotenv";
configDotenv();

/**
 * Wrapper to handle three authorization scenarios:
 * 1. USE_DB_AUTHENTICATION=false, API_KEY not set: always allow (bypass DB)
 * 2. USE_DB_AUTHENTICATION=false, API_KEY set: check key match (bypass DB if matched)
 * 3. USE_DB_AUTHENTICATION=true: use database authentication
 */
export function withAuth<T, U extends any[]>(
  originalFunction: (...args: U) => Promise<T>,
  mockSuccess: T,
) {
  return async function (...args: U): Promise<T> {
    const useDbAuthentication = process.env.USE_DB_AUTHENTICATION === "true";

    if (!useDbAuthentication && !process.env.API_KEY) {
      // Scenario 1: No DB authentication and no API_KEY - always allow
      // Return bypass response (no database connection needed)
      return mockSuccess;
    } else {
      // Scenario 2 and 3:
      // - If !useDbAuthentication && API_KEY exists: Check API_KEY only (handled in originalFunction)
      // - If useDbAuthentication: Full DB authentication
      return await originalFunction(...args);
    }
  };
}
