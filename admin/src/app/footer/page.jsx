"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function FooterAdminPanel() {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [tempItem, setTempItem] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${API_URL}/api/footer`)
      .then((res) => res.json())
      .then((data) => {
        setFooter({ ...data, brand: data.brand || {}, contact: data.contact || {} });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load footer.");
        setLoading(false);
      });
  }, [API_URL]);

  const handleSave = async (updatedFooter) => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (updatedFooter.brand?.logoFile) {
        formData.append("logo", updatedFooter.brand.logoFile);
        delete updatedFooter.brand.logoFile;
      }
      formData.append("brand", JSON.stringify(updatedFooter.brand || {}));
      formData.append("contact", JSON.stringify(updatedFooter.contact || {}));
      formData.append("copyrightText", updatedFooter.copyrightText || "");

      const res = await fetch(`${API_URL}/api/footer`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.footer) {
        setFooter(data.footer);
        toast.success("✅ Changes saved!");
      } else toast.error("❌ Failed to save footer.");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save footer.");
    }
    setSaving(false);
  };

  const toastOptions = {
    success: { style: { background: "#16a34a", color: "white", fontWeight: "bold" }, iconTheme: { primary: "white", secondary: "#16a34a" } },
    error: { style: { background: "#dc2626", color: "white", fontWeight: "bold" }, iconTheme: { primary: "white", secondary: "#dc2626" } },
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!footer) return <p>No footer data found.</p>;

  const renderFieldEditor = (section, field, value) =>
    editing === `${section}-${field}` ? (
      <>
        <input type="text" value={tempItem || ""} onChange={(e) => setTempItem(e.target.value)} className="flex-1 p-2 border rounded" />
        <div className="flex gap-2">
          <button onClick={() => { const updated = { ...footer, [section]: { ...footer[section], [field]: tempItem } }; setFooter(updated); setEditing(null); handleSave(updated); }} className="bg-green-500 text-white px-2 py-1 rounded">Save</button>
          <button onClick={() => setEditing(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
        </div>
      </>
    ) : (
      <>
        <p className="flex-1"><strong>{field}:</strong> {value || "Not set"}</p>
        <div className="flex gap-2">
          <button onClick={() => { setEditing(`${section}-${field}`); setTempItem(value || ""); }} className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
          <button onClick={() => { const updated = { ...footer, [section]: { ...footer[section] } }; delete updated[section][field]; setFooter(updated); handleSave(updated); toast.success(`🗑 Deleted ${section} field: ${field}`); }} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
        </div>
      </>
    );

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-lg space-y-6">
      <Toaster position="top-right" toastOptions={toastOptions} />
      <h2 className="text-2xl font-bold mb-4">🛠 Footer Admin Panel</h2>

      {/* BRAND INFO */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="font-semibold">Brand Info</h3>
        <div className="flex justify-between items-center gap-4 border-b py-1">{renderFieldEditor("brand", "title", footer.brand?.title || "")}</div>
        <div className="flex justify-between items-center gap-4 border-b py-1">{renderFieldEditor("brand", "about", footer.brand?.about || "")}</div>

        {/* Logo */}
        <div className="flex flex-col gap-2 border-b py-1">
          <label className="text-sm font-medium">Logo</label>
          {footer.brand?.logo ? (
            <div className="flex items-center gap-3">
              <img src={footer.brand.logo} alt="Brand Logo" className="h-12 w-auto border rounded" />
              <button onClick={() => { const updated = { ...footer, brand: { ...footer.brand, logo: "" } }; setFooter(updated); handleSave(updated); toast.error("❌ Logo removed"); }} className="bg-red-600 text-white px-2 py-1 rounded">🗑 Remove</button>
            </div>
          ) : (
            <>
              <input type="file" id="logoUpload" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (!file) return; const updated = { ...footer, brand: { ...footer.brand, logoFile: file } }; setFooter(updated); handleSave(updated); }} />
              <button onClick={() => document.getElementById("logoUpload").click()} className="bg-blue-600 text-white px-3 py-1 rounded">☁ Upload Logo</button>
            </>
          )}
        </div>
      </div>

      {/* CONTACT INFO */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="font-semibold flex justify-between items-center">
          Contact Info
        </h3>
        {Object.keys(footer.contact).map((field) => (
          <div key={field} className="flex justify-between items-center gap-4 border-b py-1">
            {renderFieldEditor("contact", field, footer.contact[field])}
          </div>
        ))}
      </div>

      {/* COPYRIGHT */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="font-semibold">Copyright</h3>
        {editing === "copyright" ? (
          <div className="flex gap-2">
            <input type="text" value={tempItem || ""} onChange={(e) => setTempItem(e.target.value)} className="flex-1 p-2 border rounded" />
            <button onClick={() => { const updated = { ...footer, copyrightText: tempItem }; setFooter(updated); setEditing(null); handleSave(updated); }} className="bg-green-500 text-white px-2 py-1 rounded">Save</button>
            <button onClick={() => setEditing(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p>{footer.copyrightText || "Not set"}</p>
            <button onClick={() => { setEditing("copyright"); setTempItem(footer.copyrightText || ""); }} className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
          </div>
        )}
      </div>
    </div>
  );
}
