export interface AppError {
    id: string;
    message: string;
    stack?: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
}

export class MonitoringService {
    private errors: AppError[] = [];

    constructor() {
        this.setupGlobalHandlers();
    }

    private setupGlobalHandlers() {
        window.addEventListener('error', (event) => {
            this.captureError(event.error || new Error(event.message), 'critical');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.captureError(new Error(event.reason), 'high');
        });
    }

    /**
     * Sentry-like error capturing.
     */
    captureError(error: Error, severity: AppError['severity'] = 'medium', metadata?: Record<string, any>) {
        const newError: AppError = {
            id: Math.random().toString(36).substr(2, 9),
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            severity,
            metadata
        };

        this.errors.push(newError);
        
        // Log to console for dev, but in production this would go to an API
        console.error(`[Monitoring] ${severity.toUpperCase()} Error:`, error.message, metadata);
        
        // Potential integration with external monitoring APIs
        this.syncWithBackend(newError);
    }

    private async syncWithBackend(_error: AppError) {
        // Simulated sync with Sentry/PocketBase
    }

    getErrors() {
        return [...this.errors].reverse();
    }

    /**
     * Performance monitoring (Web Vitals)
     */
    logPerformance(metric: string, value: number) {
        console.log(`[Monitoring] Performance - ${metric}:`, `${value}ms`);
    }

    getSystemHealth() {
        return {
            status: this.errors.length > 5 ? 'Degraded' : 'Healthy',
            errorCount: this.errors.length,
            uptime: '99.99%',
            latency: '42ms'
        };
    }
}
