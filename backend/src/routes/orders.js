// backend/routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import PDFDocument from "pdfkit";
import { getReceiptContent } from "../pdfTemplates/receiptContent.js";

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

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
});

/**
 * GET /api/orders/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order", details: err.message });
  }
});

/**
 * GET /api/orders/:id/receipt
 * Generate PDF receipt
 */
router.get("/:id/receipt", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const fileName = `HabibsFashion-${order.orderId || order._id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const doc = new PDFDocument();
    doc.pipe(res);

    // Use modular PDF content
    const content = getReceiptContent(order);
    content.forEach(line => {
      if (line.moveDown) doc.moveDown(line.moveDown);
      else doc.text(line.text, line.options || {});
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to generate receipt", details: err.message });
  }
});

/**
 * POST /api/orders
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
