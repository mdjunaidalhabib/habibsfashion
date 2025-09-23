// File: backend/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: { type: String, required: true },
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    billing: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      division: { type: String, required: true },
      district: { type: String, required: true },
      thana: { type: String, required: true },
      note: String,
    },

    promoCode: String,
    userId: { type: String },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // Order lifecycle
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingId: { type: String },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
