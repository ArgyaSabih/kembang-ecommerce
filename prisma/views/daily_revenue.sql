-- Daily Revenue VIEW untuk analytics harian
-- DROP VIEW jika sudah ada
DROP VIEW IF EXISTS daily_revenue_view;

-- Create Daily Revenue VIEW
CREATE VIEW daily_revenue_view AS
SELECT 
    DATE(o."createdAt") as date,
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'COMPLETED' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.status = 'PENDING' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) as cancelled_orders,
    COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o."totalAmount" ELSE 0 END), 0) as total_revenue,
    COALESCE(AVG(CASE WHEN o.status = 'COMPLETED' THEN o."totalAmount" ELSE NULL END), 0) as avg_order_value,
    COALESCE(MAX(CASE WHEN o.status = 'COMPLETED' THEN o."totalAmount" ELSE 0 END), 0) as highest_order,
    COALESCE(MIN(CASE WHEN o.status = 'COMPLETED' AND o."totalAmount" > 0 THEN o."totalAmount" ELSE NULL END), 0) as lowest_order
FROM "Order" o
GROUP BY DATE(o."createdAt")
ORDER BY date DESC;
