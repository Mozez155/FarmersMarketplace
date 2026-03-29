/**
 * Traceability event helpers.
 * All writes are fire-and-forget (errors are logged, not thrown) to avoid
 * breaking the main transaction flow.
 */
const db = require('../db/schema');

const EVENT_DESCRIPTIONS = {
  listed:    'Product listed on marketplace',
  sold:      'Order placed and payment received',
  shipped:   'Order shipped by farmer',
  delivered: 'Order delivered to buyer',
  harvested: 'Product harvested at farm',
};

async function recordEvent({ productId, orderId = null, eventType, description, location }) {
  try {
    await db.query(
      `INSERT INTO traceability_events (product_id, order_id, event_type, description, location)
       VALUES ($1, $2, $3, $4, $5)`,
      [productId, orderId, eventType, description || EVENT_DESCRIPTIONS[eventType] || eventType, location || null]
    );
  } catch (e) {
    console.error(`[Traceability] Failed to record "${eventType}" event:`, e.message);
  }
}

module.exports = { recordEvent };
