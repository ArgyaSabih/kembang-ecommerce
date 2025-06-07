-- Dashboard Summary VIEW untuk overview metrics
-- DROP VIEW jika sudah ada
DROP VIEW IF EXISTS dashboard_summary_view;

-- Create Dashboard Summary VIEW
CREATE VIEW dashboard_summary_view AS
SELECT 
    -- Product Metrics
    (SELECT COUNT(*) FROM "Product") as total_products,
    (SELECT COUNT(*) FROM "Product" WHERE stock > 0) as products_in_stock,
    (SELECT COUNT(*) FROM "Product" WHERE stock = 0) as products_out_of_stock,
    (SELECT COUNT(*) FROM "Product" WHERE stock <= 5 AND stock > 0) as products_low_stock,
    
    -- Revenue Metrics (Today)
    (SELECT COALESCE(SUM("totalAmount"), 0) 
     FROM "Order" 
     WHERE DATE("createdAt") = CURRENT_DATE AND status = 'COMPLETED') as today_revenue,
    
    -- Revenue Metrics (This Week)
    (SELECT COALESCE(SUM("totalAmount"), 0) 
     FROM "Order" 
     WHERE "createdAt" >= DATE_TRUNC('week', CURRENT_DATE) AND status = 'COMPLETED') as week_revenue,
    
    -- Revenue Metrics (This Month)
    (SELECT COALESCE(SUM("totalAmount"), 0) 
     FROM "Order" 
     WHERE "createdAt" >= DATE_TRUNC('month', CURRENT_DATE) AND status = 'COMPLETED') as month_revenue,
    
    -- Order Metrics (Today)
    (SELECT COUNT(*) 
     FROM "Order" 
     WHERE DATE("createdAt") = CURRENT_DATE) as today_orders,
    
    -- Order Metrics (Pending)
    (SELECT COUNT(*) 
     FROM "Order" 
     WHERE status = 'PENDING') as pending_orders,
    
    -- Category Metrics
    (SELECT COUNT(*) FROM "Category") as total_categories,
    
    -- Current timestamp
    NOW() as generated_at;
