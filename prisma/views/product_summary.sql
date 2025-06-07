-- Product Summary VIEW untuk dashboard analytics
-- DROP VIEW jika sudah ada
DROP VIEW IF EXISTS product_summary_view;

-- Create Product Summary VIEW
CREATE VIEW product_summary_view AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.stock,
    p.description,
    p."createdAt" as created_at,
    p."updatedAt" as updated_at,
    COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN oi.quantity ELSE 0 END), 0) as total_sold,
    COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN oi.quantity * oi.price ELSE 0 END), 0) as total_revenue,
    CASE 
        WHEN p.stock = 0 THEN 'Out of Stock'
        WHEN p.stock <= 5 THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status,
    CASE 
        WHEN COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN oi.quantity ELSE 0 END), 0) = 0 THEN 'No Sales'
        WHEN COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN oi.quantity ELSE 0 END), 0) <= 5 THEN 'Low Sales'
        WHEN COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN oi.quantity ELSE 0 END), 0) <= 15 THEN 'Medium Sales'
        ELSE 'High Sales'
    END as sales_performance,
    COUNT(CASE WHEN o.status = 'COMPLETED' THEN oi.id ELSE NULL END) as order_count
FROM "Product" p
LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
LEFT JOIN "Order" o ON oi."orderId" = o.id
GROUP BY p.id, p.name, p.price, p.stock, p.description, p."createdAt", p."updatedAt"
ORDER BY total_revenue DESC;
