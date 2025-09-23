"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_METHODS = ["cod", "bkash"];
const PAYMENT_STATUS = ["pending", "paid", "failed"];

export default function OrdersPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "pending",
    trackingId: "",
    cancelReason: "",
  });

  const [filter, setFilter] = useState({
    status: "",
    paymentStatus: "",
    q: "",
  });

  // Fetch Orders
  async function fetchOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.paymentStatus) params.append("paymentStatus", filter.paymentStatus);

      const res = await fetch(`${API}/api/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.status, filter.paymentStatus]);

  // Search filter
  const filtered = useMemo(() => {
    if (!filter.q) return orders;
    const q = filter.q.toLowerCase();
    return orders.filter((o) => {
      const idHit = o._id?.toLowerCase().includes(q);
      const nameHit = o.billing?.name?.toLowerCase().includes(q);
      const phoneHit = o.billing?.phone?.toLowerCase().includes(q);
      return idHit || nameHit || phoneHit;
    });
  }, [orders, filter.q]);

  // ---------------- Export Functions ----------------
  function exportCSV() {
    const csv = Papa.unparse(
      filtered.map((o) => ({
        OrderID: o._id,
        Customer: o.billing?.name || "",
        Phone: o.billing?.phone || "",
        Address: o.billing?.address || "",
        Status: o.status,
        Payment: o.paymentStatus,
        Method: o.paymentMethod,
        Total: o.total,
        Date: o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "orders.csv");
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((o) => ({
        OrderID: o._id,
        Customer: o.billing?.name || "",
        Phone: o.billing?.phone || "",
        Address: o.billing?.address || "",
        Status: o.status,
        Payment: o.paymentStatus,
        Method: o.paymentMethod,
        Total: o.total,
        Date: o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "orders.xlsx");
  }

function exportPDF() {
  const doc = new jsPDF();
  doc.text("Orders Report", 14, 16);

  const tableData = filtered.map((o) => [
    o._id,
    o.billing?.name || "",
    o.billing?.phone || "",
    o.status,
    o.paymentStatus,
    o.paymentMethod?.toUpperCase(),
    "৳" + o.total,
    o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
  ]);

  autoTable(doc, {
    head: [["OrderID", "Customer", "Phone", "Status", "Payment", "Method", "Total", "Date"]],
    body: tableData,
    startY: 20,
    styles: { fontSize: 8 },
  });

  doc.save("orders.pdf");
}

  // --------------------------------------------------

  // Open edit modal with data
  function openEdit(order) {
    setCurrentId(order._id);
    setForm({
      status: order.status || "pending",
      paymentMethod: order.paymentMethod || "cod",
      paymentStatus: order.paymentStatus || "pending",
      trackingId: order.trackingId || "",
      cancelReason: order.cancelReason || "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setCurrentId(null);
  }

  // Save (PUT)
  async function saveOrder(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/orders/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o._id === currentId ? data : o)));
        closeModal();
      } else {
        console.error("Update failed:", data?.error || data);
      }
    } catch (err) {
      console.error("Error updating order:", err);
    }
  }

  // Delete
  async function deleteOrder(id) {
    if (!confirm("Delete this order?")) return;
    try {
      const res = await fetch(`${API}/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
      }
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  }

  // Utilities
  function Badge({ children, className = "" }) {
    return (
      <span className={`inline-block rounded px-2 py-0.5 text-xs border ${className}`}>
        {children}
      </span>
    );
  }
  function statusColor(s) {
    switch (s) {
      case "pending": return "border-yellow-300 text-yellow-700 bg-yellow-50";
      case "confirmed": return "border-blue-300 text-blue-700 bg-blue-50";
      case "processing": return "border-indigo-300 text-indigo-700 bg-indigo-50";
      case "shipped": return "border-cyan-300 text-cyan-700 bg-cyan-50";
      case "delivered": return "border-green-300 text-green-700 bg-green-50";
      case "cancelled": return "border-red-300 text-red-700 bg-red-50";
      default: return "border-gray-300 text-gray-700 bg-gray-50";
    }
  }
  function payColor(p) {
    switch (p) {
      case "paid": return "border-green-300 text-green-700 bg-green-50";
      case "failed": return "border-red-300 text-red-700 bg-red-50";
      default: return "border-gray-300 text-gray-700 bg-gray-50";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Orders</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-indigo-600 text-white px-3 py-1 rounded">
            Export CSV
          </button>
          <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1 rounded">
            Export Excel
          </button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded">
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <input
          className="border rounded px-3 py-2 w-full md:w-72"
          placeholder="Search by OrderID / Name / Phone"
          value={filter.q}
          onChange={(e) => setFilter({ ...filter, q: e.target.value })}
        />
        <select
          className="border rounded px-3 py-2 w-full md:w-48"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2 w-full md:w-48"
          value={filter.paymentStatus}
          onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value })}
        >
          <option value="">All payments</option>
          {PAYMENT_STATUS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          onClick={fetchOrders}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-gray-600">Loading orders…</div>}

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((o) => (
          <div key={o._id} className="border rounded-lg p-3 bg-white">
            <div className="flex justify-between items-start">
              <div className="font-mono text-xs text-gray-500">#{o._id}</div>
              <div className="flex gap-2">
                <Badge className={statusColor(o.status)}>{o.status}</Badge>
                <Badge className={payColor(o.paymentStatus)}>{o.paymentStatus}</Badge>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-semibold">{o.billing?.name}</div>
              <div className="text-sm text-gray-600">{o.billing?.phone}</div>
              <div className="text-sm text-gray-600">{o.billing?.address}</div>
            </div>
            <div className="mt-2 text-sm">
              <div className="font-medium">Items</div>
              <ul className="list-disc ml-5">
                {o.items?.map((it, idx) => (
                  <li key={idx}>
                    {it.name} × {it.qty} — ৳{it.price}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2 text-sm">
              <div>Subtotal: ৳{o.subtotal}</div>
              <div>Delivery: ৳{o.deliveryCharge}</div>
              {!!o.discount && <div>Discount: -৳{o.discount}</div>}
              <div className="font-semibold">Total: ৳{o.total}</div>
              <div className="text-xs text-gray-600">
                Method: {o.paymentMethod?.toUpperCase()}
                {o.trackingId ? ` • Track: ${o.trackingId}` : ""}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => openEdit(o)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                Edit
              </button>
              <button onClick={() => deleteOrder(o._id)} className="bg-red-600 text-white px-3 py-1 rounded">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg border">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Items</th>
              <th className="text-left p-3">Totals</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-3 align-top">
                  <div className="font-mono text-xs text-gray-500">#{o._id}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="font-semibold">{o.billing?.name}</div>
                  <div className="text-sm text-gray-600">{o.billing?.phone}</div>
                  <div className="text-xs text-gray-500">{o.billing?.address}</div>
                </td>
                <td className="p-3 align-top">
                  <ul className="list-disc ml-5 text-sm">
                    {o.items?.map((it, idx) => (
                      <li key={idx}>
                        {it.name} × {it.qty} — ৳{it.price}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3 align-top text-sm">
                  <div>Subtotal: ৳{o.subtotal}</div>
                  <div>Delivery: ৳{o.deliveryCharge}</div>
                  {!!o.discount && <div>Discount: -৳{o.discount}</div>}
                  <div className="font-semibold">Total: ৳{o.total}</div>
                </td>
                <td className="p-3 align-top">
                  <div className="text-xs mb-1">
                    Method: <Badge>{o.paymentMethod?.toUpperCase()}</Badge>
                  </div>
                  <Badge className={payColor(o.paymentStatus)}>{o.paymentStatus}</Badge>
                </td>
                <td className="p-3 align-top">
                  <div className="flex flex-col gap-1">
                    <Badge className={statusColor(o.status)}>{o.status}</Badge>
                    {o.trackingId && (
                      <span className="text-xs text-gray-600">Track: {o.trackingId}</span>
                    )}
                    {o.cancelReason && (
                      <span className="text-xs text-red-600">Reason: {o.cancelReason}</span>
                    )}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(o)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                      Edit
                    </button>
                    <button onClick={() => deleteOrder(o._id)} className="bg-red-600 text-white px-3 py-1 rounded">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-5 w-full max-w-lg relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-600 hover:text-black">
              ✖
            </button>
            <h3 className="text-lg font-semibold mb-4">Update Order</h3>
            <form onSubmit={saveOrder} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Order Status</label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Status</label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={form.paymentStatus}
                    onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                  >
                    {PAYMENT_STATUS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tracking ID</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Optional"
                    value={form.trackingId}
                    onChange={(e) => setForm({ ...form, trackingId: e.target.value })}
                  />
                </div>
              </div>
              {form.status === "cancelled" && (
                <div>
                  <label className="text-sm font-medium">Cancel Reason</label>
                  <textarea
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Why cancelled?"
                    value={form.cancelReason}
                    onChange={(e) => setForm({ ...form, cancelReason: e.target.value })}
                  />
                </div>
              )}
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
