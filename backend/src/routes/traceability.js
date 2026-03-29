const router = require('express').Router();
const db = require('../db/schema');
const auth = require('../middleware/auth');

/**
 * GET /api/orders/:id/trace
 * Returns the traceability timeline for an order (buyer of that order only).
 */
router.get('/orders/:id/trace', auth, async (req, res) => {
  const orderId = parseInt(req.params.id, 10);

  // Verify the order belongs to this buyer
  const { rows: orderRows } = await db.query(
    'SELECT id, buyer_id, product_id FROM orders WHERE id = $1',
    [orderId]
  );
  const order = orderRows[0];
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  if (order.buyer_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  const { rows: events } = await db.query(
    `SELECT id, product_id, order_id, event_type, description, location, created_at
     FROM traceability_events
     WHERE product_id = $1
     ORDER BY created_at ASC`,
    [order.product_id]
  );

  res.json({ success: true, data: events });
});

module.exports = router;
