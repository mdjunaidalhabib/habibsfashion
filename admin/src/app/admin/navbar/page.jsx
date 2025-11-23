"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function NavbarAdminPanel() {
  const [navbar, setNavbar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Fetch Navbar Data
  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/navbar`);
        const data = await res.json();
        setNavbar({ ...data, brand: data.brand || {} });
      } catch (err) {
        toast.error("❌ Failed to fetch navbar data");
      } finally {
        setLoading(false);
      }
    };
    fetchNavbar();
  }, [API_URL]);

  // ✅ Save Navbar (brand + removeLogo + optional file)
  const handleSave = async (nextNavbar) => {
    setSaving(true);
    try {
      const payload = structuredClone(nextNavbar);

      const formData = new FormData();

      // file থাকলে পাঠাও
      if (payload.brand?.logoFile) {
        formData.append("logo", payload.brand.logoFile);
        delete payload.brand.logoFile;
      }

      // removeLogo flag থাকলে পাঠাও
      if (payload.removeLogo) {
        formData.append("removeLogo", "true");
        delete payload.removeLogo;
      }

      formData.append("brand", JSON.stringify(payload.brand || {}));

      const res = await fetch(`${API_URL}/api/navbar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Save failed");

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

  // ✅ Upload Logo (same endpoint)
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updated = {
      ...navbar,
      brand: { ...navbar.brand, logoFile: file },
    };

    setNavbar(updated);
    handleSave(updated);
  };

  if (loading) return <p>Loading...</p>;
  if (!navbar) return <p>No navbar data</p>;

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
          disabled={saving}
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
        <label className="block font-medium mb-1">Logo</label>

        {navbar?.brand?.logo ? (
          <div className="flex items-center gap-3 mb-2">
            <img
              src={navbar.brand.logo}
              alt="Logo"
              className="h-16 rounded border"
            />

            {/* ✅ Remove Logo */}
            <button
              disabled={saving}
              onClick={() => {
                const updated = {
                  ...navbar,
                  brand: {
                    ...navbar.brand,
                    logo: "",
                    logoPublicId: "",
                  },
                  removeLogo: true,
                };
                setNavbar(updated);
                handleSave(updated);
                toast.success("🗑 Logo removed");
              }}
              className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        ) : null}

        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          disabled={saving}
        />
      </div>

      {saving && (
        <p className="text-sm text-gray-500 italic">Saving changes...</p>
      )}
    </div>
  );
}
