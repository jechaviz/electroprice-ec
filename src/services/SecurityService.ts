import { sanitizeInput } from "../utils/sanitize";

export class SecurityService {
    /**
     * OWASP: Defensive coding - validate and sanitize all inputs
     */
    static validateAndSanitize(input: string, type: 'email' | 'text' | 'password' = 'text'): string {
        const trimmed = input.trim();
        if (type === 'email') {
            // Simple regex validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                throw new Error("Invalid email format");
            }
        }
        
        return sanitizeInput(trimmed);
    }

    /**
     * Basic rate limiting placeholder for client-side protection
     */
    static checkRateLimit(action: string, limit: number = 5, timeframe: number = 60000): boolean {
        const now = Date.now();
        const key = `rate_limit_${action}`;
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        
        const recentActions = history.filter((timestamp: number) => now - timestamp < timeframe);
        if (recentActions.length >= limit) {
            return false;
        }
        
        recentActions.push(now);
        localStorage.setItem(key, JSON.stringify(recentActions));
        return true;
    }

    /**
     * Calculates a fraud risk score (0-100) based on order patterns.
     */
    static calculateFraudScore(order: { total: number, items: any[] }): number {
        let score = 0;

        // Pattern 1: High value orders from new users (simulated)
        if (order.total > 1000) score += 30;

        // Pattern 2: Bulk quantity of same items
        const bulkItem = order.items.find((i: any) => i.quantity > 5);
        if (bulkItem) score += 20;

        // Pattern 3: Velocity check (simulated)
        if (Math.random() > 0.9) score += 40; // Simulated high velocity

        return Math.min(100, score);
    }
}
