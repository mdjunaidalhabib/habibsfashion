// File: backend/routes/orders.js
import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

/**
 * GET /api/orders
 * Optional query: ?status=pending&paymentStatus=paid
 */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
});

/**
 * POST /api/orders
 * Body: { items[], subtotal, deliveryCharge, discount?, total, billing{}, promoCode?, userId?, paymentMethod, paymentStatus, status?, trackingId? }
 */
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    const saved = await Order.findById(order._id);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Failed to create order", details: err.message });
  }
});

/**
 * PUT /api/orders/:id
 * Update any fields (status, paymentStatus, trackingId, cancelReason etc.)
 */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update order", details: err.message });
  }
});

/**
 * DELETE /api/orders/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order", details: err.message });
  }
});

export default router;
