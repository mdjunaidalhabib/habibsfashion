// backend/pdfTemplates/receiptContent.js
import dayjs from "dayjs";

const BRAND_NAME = "Habib's Fashion";

// Helper function for currency
function formatCurrency(amount) {
  return `৳${Number(amount).toLocaleString()}`;
}

export function getReceiptContent(order) {
  const lines = [];

  // ===================== HEADER =====================
  lines.push({
    text: `🛍️ ${BRAND_NAME} - Receipt`,
    options: { fontSize: 22, align: "center", bold: true, color: "#1D4ED8" }, // Tailwind blue-700
  });
  lines.push({ moveDown: 1.5 });

  // ===================== ORDER INFO =====================
  lines.push({ text: "📄 Order Information", options: { fontSize: 14, bold: true, underline: true, color: "#1E40AF" } });
  lines.push({ text: `Order ID: ${order.orderId || order._id}`, options: { fontSize: 12 } });
  lines.push({ text: `Date: ${dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}`, options: { fontSize: 12 } });
  lines.push({ text: `Status: ${order.status}`, options: { fontSize: 12 } });
  lines.push({ moveDown: 0.5 });
  lines.push({ canvas: [{ type: "line", x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 1, color: "#E5E7EB" }] }); // Tailwind gray-200
  lines.push({ moveDown: 0.5 });

  // ===================== CUSTOMER INFO =====================
  const billing = order.billing || {};
  const address = [billing.address, billing.thana, billing.district, billing.division].filter(Boolean).join(", ");

  lines.push({ text: "👤 Customer Information", options: { fontSize: 14, bold: true, underline: true, color: "#166534" } });
  lines.push({ text: `Name: ${billing.name || "-"}`, options: { fontSize: 12 } });
  lines.push({ text: `Phone: ${billing.phone || "-"}`, options: { fontSize: 12 } });
  lines.push({ text: `Address: ${address || "-"}`, options: { fontSize: 12 } });
  lines.push({ moveDown: 0.5 });
  lines.push({ canvas: [{ type: "line", x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 1, color: "#E5E7EB" }] });
  lines.push({ moveDown: 0.5 });

  // ===================== ITEMS =====================
  lines.push({ text: "📦 Items Purchased", options: { fontSize: 14, bold: true, underline: true, color: "#374151" } });
  order.items.forEach((item, idx) => {
    lines.push({
      text: `${idx + 1}. ${item.name} x ${item.qty} — ${formatCurrency(item.price * item.qty)}`,
      options: { indent: 15, fontSize: 12 },
    });
  });
  lines.push({ moveDown: 0.5 });
  lines.push({ canvas: [{ type: "line", x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 1, color: "#E5E7EB" }] });
  lines.push({ moveDown: 0.5 });

  // ===================== PRICING =====================
  lines.push({ text: "💰 Pricing Summary", options: { fontSize: 14, bold: true, underline: true, color: "#B45309" } });
  lines.push({ text: `Subtotal: ${formatCurrency(order.subtotal)}`, options: { fontSize: 12, indent: 15 } });
  lines.push({ text: `Delivery Charge: ${formatCurrency(order.deliveryCharge)}`, options: { fontSize: 12, indent: 15 } });
  if (order.discount) {
    lines.push({ text: `Discount: -${formatCurrency(order.discount)}`, options: { fontSize: 12, indent: 15, color: "#DC2626" } }); // red-600
  }
  lines.push({ text: `Total: ${formatCurrency(order.total)}`, options: { fontSize: 16, bold: true, underline: true, color: "#15803D" } }); // green-700
  lines.push({ moveDown: 1 });

  // ===================== FOOTER =====================
  lines.push({
    text: `✅ Thank you for shopping with ${BRAND_NAME}!`,
    options: { align: "center", fontSize: 12, italics: true, color: "#6B7280" }, // gray-500
  });

  return lines;
}
