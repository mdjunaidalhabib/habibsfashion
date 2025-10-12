"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import OrdersGrid from "../../../components/orders/OrdersGrid";
import OrdersTable from "../../../components/orders/OrdersTable";
import EditOrderModal from "../../../components/orders/EditOrderModal";

export default function OrdersPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({
    status: "pending",
    paymentMethod: "cod",
    trackingId: "",
    cancelReason: "",
    billing: { name: "", phone: "", address: "" },
  });

  const [filter, setFilter] = useState({ status: "", q: "" });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      const res = await fetch(`${API}/api/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter.status]);

  const filtered = useMemo(() => {
    if (!filter.q) return orders;
    const q = filter.q.toLowerCase();
    return orders.filter(o => {
      const idHit = o._id?.toLowerCase().includes(q);
      const nameHit = o.billing?.name?.toLowerCase().includes(q);
      const phoneHit = o.billing?.phone?.toLowerCase().includes(q);
      return idHit || nameHit || phoneHit;
    });
  }, [orders, filter.q]);

  // ---------------- Export ----------------
  const exportCSV = () => {
    const csv = Papa.unparse(filtered.map(o => ({
      OrderID: o._id,
      Customer: o.billing?.name || "",
      Phone: o.billing?.phone || "",
      Address: o.billing?.address || "",
      Status: o.status,
      Method: o.paymentMethod,
      Total: o.total,
      Date: o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
    })));
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "orders.csv");
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered.map(o => ({
      OrderID: o._id,
      Customer: o.billing?.name || "",
      Phone: o.billing?.phone || "",
      Address: o.billing?.address || "",
      Status: o.status,
      Method: o.paymentMethod,
      Total: o.total,
      Date: o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "orders.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders Report", 14, 16);
    const tableData = filtered.map(o => [
      o._id, o.billing?.name || "", o.billing?.phone || "", o.status, o.paymentMethod?.toUpperCase(), "৳" + o.total, o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""
    ]);
    autoTable(doc, {
      head: [["OrderID","Customer","Phone","Status","Method","Total","Date"]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("orders.pdf");
  };

  const openEdit = (order) => {
    setCurrentId(order._id);
    setForm({
      status: order.status || "pending",
      paymentMethod: order.paymentMethod || "cod",
      trackingId: order.trackingId || "",
      cancelReason: order.cancelReason || "",
      billing: {
        name: order.billing?.name || "",
        phone: order.billing?.phone || "",
        address: order.billing?.address || "",
      },
    });
    setOpen(true);
  };

  const updateOrder = async () => {
    try {
      const res = await fetch(`${API}/api/orders/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");
      setOpen(false);
      fetchOrders();
    } catch (e) { console.error(e); alert("Failed to update order."); }
  };

  const deleteOrder = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`${API}/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchOrders();
    } catch (e) { console.error(e); alert("Failed to delete order."); }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Orders</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCSV} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">CSV</button>
          <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Excel</button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded text-sm">PDF</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Search by OrderID / Name / Phone"
          value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} />
        <select className="border rounded px-3 py-2 sm:w-40"
          value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All status</option>
          {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={fetchOrders} className="bg-gray-700 text-white px-4 py-2 rounded text-sm">Refresh</button>
      </div>

      {loading && <div className="text-gray-600">Loading orders…</div>}

      <OrdersGrid orders={filtered} onEdit={openEdit} onDelete={deleteOrder} />
      <OrdersTable orders={filtered} onEdit={openEdit} onDelete={deleteOrder} />
      <EditOrderModal open={open} form={form} setForm={setForm} onSave={updateOrder} onClose={() => setOpen(false)} />
    </div>
  );
}
