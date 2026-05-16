export class ExportService {
    /**
     * Exports an array of objects to a CSV file.
     */
    exportToCSV(data: any[], fileName: string) {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => {
            return Object.values(obj).map(val => {
                // Escape quotes and handle strings with commas
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            }).join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.appendChild(link);
            document.body.removeChild(link);
        }
    }

    /**
     * Generates a "Revenue Report" summary (Text/HTML simulation for PDF).
     */
    exportRevenueReport(orders: any[]) {
        const total = orders.reduce((sum, o) => sum + o.total, 0);
        const report = `
            REVENUE REPORT
            Date: ${new Date().toLocaleString()}
            Total Orders: ${orders.length}
            Total Revenue: ${total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            
            Status Breakdown:
            ${Array.from(new Set(orders.map(o => o.status))).map(status => {
                const count = orders.filter(o => o.status === status).length;
                return `${status}: ${count}`;
            }).join('\n')}
        `;
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Revenue_Report_${Date.now()}.txt`;
        link.click();
    }
}
