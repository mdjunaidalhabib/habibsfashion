// File: backend/routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import PDFDocument from "pdfkit";   // ✅ npm install pdfkit করতে হবে

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
    res
      .status(500)
      .json({ error: "Failed to fetch orders", details: err.message });
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
 * → generate PDF receipt for download
 */
router.get("/:id/receipt", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // ✅ Brand name + Order ID সহ filename
    const fileName = `HabibsFashion-${order.orderId || order._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    const doc = new PDFDocument();
    doc.pipe(res);

    // ✅ PDF content
    doc.fontSize(18).text("🧾 Habib's Fashion - Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order.orderId || order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();
    doc.text(`Customer: ${order.billing?.name} (${order.billing?.phone})`);
    doc.text(
      `Address: ${order.billing?.address}, ${order.billing?.thana}, ${order.billing?.district}, ${order.billing?.division}`
    );
    doc.moveDown();

    doc.text("📦 Items:", { underline: true });
    order.items.forEach((item, idx) => {
      doc.text(
        `${idx + 1}. ${item.name} x ${item.qty} — ৳${item.price * item.qty}`,
        { indent: 20 }
      );
    });

    doc.moveDown();
    doc.text(`Subtotal: ৳${order.subtotal}`);
    doc.text(`Delivery: ৳${order.deliveryCharge}`);
    if (order.discount) doc.text(`Discount: -৳${order.discount}`);
    doc.fontSize(14).text(`Total: ৳${order.total}`, { underline: true });

    doc.moveDown();
    doc.text("✅ Thank you for shopping with Habib's Fashion!", {
      align: "center",
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
    res
      .status(400)
      .json({ error: "Failed to create order", details: err.message });
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
    res
      .status(400)
      .json({ error: "Failed to update order", details: err.message });
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
    res
      .status(500)
      .json({ error: "Failed to delete order", details: err.message });
  }
});

export default router;
