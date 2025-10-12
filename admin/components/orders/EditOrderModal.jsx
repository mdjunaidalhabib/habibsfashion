import Badge from "./Badge";

export default function EditOrderModal({ open, form, setForm, onSave, onClose }) {
  if (!open) return null;

  const handleBillingChange = (field, value) => {
    setForm({ ...form, billing: { ...form.billing, [field]: value } });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-6 shadow-lg">
        <h3 className="text-xl font-bold">Edit Order</h3>

        {/* Order Details */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Status</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              {["cod", "bkash"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Tracking ID</label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full"
              value={form.trackingId}
              onChange={(e) => setForm({ ...form, trackingId: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Cancel Reason</label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full"
              value={form.cancelReason}
              onChange={(e) => setForm({ ...form, cancelReason: e.target.value })}
            />
          </div>
        </div>

        {/* Customer Details Card */}
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <h4 className="font-semibold text-gray-800 text-lg">Customer Details</h4>

          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-gray-600 text-sm">Name</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={form.billing.name}
                onChange={(e) => handleBillingChange("name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm">Phone</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={form.billing.phone}
                onChange={(e) => handleBillingChange("phone", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm">Address</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={form.billing.address}
                onChange={(e) => handleBillingChange("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
