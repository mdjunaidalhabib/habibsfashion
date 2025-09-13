import express from "express";
import Order from "../models/Order.js";
import PDFDocument from "pdfkit";

const router = express.Router();

// ✅ Place new order
router.post("/", async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const order = new Order({ ...req.body, userId });
    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("🔥 Order save error:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// ✅ All orders (admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ✅ Logged-in user's orders
router.get("/me", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
});

// ✅ Receipt download (🚨 must be before /:id)
router.get("/:id/receipt", async (req, res) => {
  try {
    console.log("📥 Receipt request received for ID:", req.params.id);

    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log("❌ Order not found");
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order found:", order._id);

    // PDFKit to buffer (so we can set Content-Length)
    const doc = new PDFDocument();
    const chunks = [];

    doc.on("data", (chunk) => {
      console.log("📦 PDF chunk received:", chunk.length);
      chunks.push(chunk);
    });

    doc.on("end", () => {
      console.log("✅ PDF generation finished");
      const pdfBuffer = Buffer.concat(chunks);
      console.log("📏 PDF size (bytes):", pdfBuffer.length);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=receipt-${order._id}.pdf`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader("Cache-Control", "no-store");

      res.send(pdfBuffer);
      console.log("📤 PDF sent to client");
    });

    // ---- PDF Content ----
    doc.fontSize(18).text("🛒 Order Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();

    doc.text(`Name: ${order.billing.name}`);
    doc.text(`Phone: ${order.billing.phone}`);
    doc.text(
      `Address: ${order.billing.address}, ${order.billing.thana}, ${order.billing.district}, ${order.billing.division}`
    );
    if (order.billing.note) doc.text(`Note: ${order.billing.note}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Items:", { underline: true });
    doc.font("Helvetica");
    order.items.forEach((it) => {
      doc.text(`${it.name} × ${it.qty} — ৳${it.price * it.qty}`);
    });
    doc.moveDown();

    doc.text(`Subtotal: ৳${order.subtotal}`);
    doc.text(`Delivery Charge: ৳${order.deliveryCharge}`);
    doc.font("Helvetica-Bold").text(`Grand Total: ৳${order.total}`);
    doc.end();

    console.log("🖨️ doc.end() called");
  } catch (err) {
    console.error("🔥 PDF error:", err);
    res.status(500).json({ message: "Failed to generate receipt" });
  }
});

// ✅ Single order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

export default router;
