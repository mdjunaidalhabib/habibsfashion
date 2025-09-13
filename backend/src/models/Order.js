import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
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
    userId: { type: String }, // future: logged-in user এর জন্য
    status: { type: String, default: "pending" }, // pending, confirmed, delivered
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
