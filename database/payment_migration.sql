USE campusconnect;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) NULL AFTER vendor_id,
  ADD COLUMN IF NOT EXISTS payment_status ENUM('PENDING','PAID','FAILED') NOT NULL DEFAULT 'PENDING' AFTER amount,
  ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100) NULL AFTER payment_status,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100) NULL AFTER razorpay_order_id;

UPDATE orders o
JOIN quotations q ON q.id=o.quotation_id
SET o.amount=q.amount
WHERE o.amount IS NULL;
