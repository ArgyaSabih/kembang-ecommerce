-- Category Performance VIEW untuk analytics kategori
-- DROP VIEW jika sudah ada
DROP VIEW IF EXISTS category_performance_view;

-- Create Category Performance VIEW
CREATE VIEW category_performance_view AS
SELECT 
    c.id,
    c.name as category_name,
    c."createdAt" as created_at,
    COUNT(DISTINCT pc."productId") as total_products,
    COALESCE(SUM(p.stock), 0) as total_stock,
    COUNT(CASE WHEN p.stock = 0 THEN 1 END) as out_of_stock_count,
    COUNT(CASE WHEN p.stock > 0 AND p.stock <= 5 THEN 1 END) as low_stock_count,
    COALESCE(SUM(oi.quantity * oi.price), 0) as total_category_revenue,
    COALESCE(AVG(p.price), 0) as avg_product_price,
    COUNT(DISTINCT CASE WHEN o.status = 'COMPLETED' THEN o.id END) as total_orders
FROM "Category" c
LEFT JOIN "ProductCategory" pc ON c.id = pc."categoryId"
LEFT JOIN "Product" p ON pc."productId" = p.id
LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
LEFT JOIN "Order" o ON oi."orderId" = o.id AND o.status = 'COMPLETED'
GROUP BY c.id, c.name, c."createdAt"
ORDER BY total_category_revenue DESC;
