"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function NavbarAdminPanel() {
  const [navbar, setNavbar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // API Base from .env
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Fetch Navbar Data
  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/navbar`);
        const data = await res.json();
        setNavbar(data);
      } catch (err) {
        toast.error("❌ Failed to fetch navbar data");
      } finally {
        setLoading(false);
      }
    };
    fetchNavbar();
  }, [API_URL]);

  // Save Navbar (without file)
  const handleSave = async (updatedNavbar) => {
    setSaving(true);
    try {
      const formData = new FormData();

      // Append brand JSON string
      if (updatedNavbar.brand) {
        formData.append("brand", JSON.stringify(updatedNavbar.brand));
      }

      const res = await fetch(`${API_URL}/api/navbar`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setNavbar(data.navbar);
      toast.success("✅ Navbar updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update navbar");
    } finally {
      setSaving(false);
    }
  };

  // Upload Logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/navbar`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setNavbar(data.navbar);
      toast.success("✅ Logo uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("❌ Logo upload failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <Toaster />
      <h2 className="text-xl font-bold mb-4">🛠 Navbar Admin Panel</h2>

      {/* Brand Name */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Brand Name</label>
        <input
          type="text"
          value={navbar?.brand?.name || ""}
          onChange={(e) =>
            setNavbar({
              ...navbar,
              brand: { ...navbar.brand, name: e.target.value },
            })
          }
          className="w-full border p-2 rounded"
        />
        <button
          onClick={() => handleSave(navbar)}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={saving}
        >
          {saving ? "Saving..." : "💾 Save Name"}
        </button>
      </div>

      {/* Logo Upload */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Brand Logo</label>
        {navbar?.brand?.logo && (
          <img
            src={navbar.brand.logo}
            alt="Logo"
            className="h-16 mb-2 rounded border"
          />
        )}
        <input type="file" onChange={handleLogoUpload} />
      </div>
    </div>
  );
}
