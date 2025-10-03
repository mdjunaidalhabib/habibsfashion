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

  // ✅ Fetch footer
  useEffect(() => {
    fetch(`${API_URL}/api/footer`)
      .then((res) => res.json())
      .then((data) => {
        setFooter({
          ...data,
          socials: data.socials || [],
          quickLinks: data.quickLinks || [],
          brand: data.brand || {},
          contact: data.contact || {},
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load footer.");
        setLoading(false);
      });
  }, [API_URL]);

  // ✅ Save handler
  const handleSave = async (updatedFooter) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/footer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFooter),
      });
      const updated = await res.json();
      setFooter(updated);
      toast.success("✅ Changes saved!");
    } catch (err) {
      console.error("❌ Failed to save", err);
      toast.error("❌ Failed to save footer.");
    }
    setSaving(false);
  };

  // ✅ Custom Toast Styles
  const toastOptions = {
    success: {
      style: {
        background: "#16a34a",
        color: "white",
        fontWeight: "bold",
      },
      iconTheme: {
        primary: "white",
        secondary: "#16a34a",
      },
    },
    error: {
      style: {
        background: "#dc2626",
        color: "white",
        fontWeight: "bold",
      },
      iconTheme: {
        primary: "white",
        secondary: "#dc2626",
      },
    },
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!footer) return <p>No footer data found.</p>;

  // ---------- Reusable Editor ----------
  const renderFieldEditor = (section, field, value) => (
    editing === `${section}-${field}` ? (
      <>
        <input
          type="text"
          value={tempItem || ""}
          onChange={(e) => setTempItem(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              const updated = {
                ...footer,
                [section]: { ...footer[section], [field]: tempItem },
              };
              setFooter(updated);
              setEditing(null);
              handleSave(updated);
            }}
            className="bg-green-500 text-white px-2 py-1 rounded"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(null)}
            className="bg-gray-400 text-white px-2 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </>
    ) : (
      <>
        <p className="flex-1">
          <strong>{field}:</strong> {value || "Not set"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(`${section}-${field}`);
              setTempItem(value || "");
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => {
              const updated = { ...footer };
              delete updated[section][field];
              setFooter(updated);
              handleSave(updated);
              toast.success(`🗑 Deleted ${section} field: ${field}`);
            }}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </>
    )
  );

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-lg space-y-6">
      <Toaster position="top-right" toastOptions={toastOptions} />
      <h2 className="text-2xl font-bold mb-4">🛠 Footer Admin Panel</h2>

{/* ---------- BRAND INFO ---------- */}
<div className="space-y-2 border p-3 rounded">
  <h3 className="font-semibold">Brand Info</h3>

  {/* Brand Name */}
  <div className="flex justify-between items-center gap-4 border-b py-1">
    {renderFieldEditor("brand", "name", footer.brand?.name || "")}
  </div>

  {/* Brand Website */}
  <div className="flex justify-between items-center gap-4 border-b py-1">
    {renderFieldEditor("brand", "website", footer.brand?.website || "")}
  </div>

  {/* Brand Logo Upload */}
<div className="flex flex-col gap-2 border-b py-1">
  <label className="text-sm font-medium">Logo</label>

  {footer.brand?.logo ? (
    <div className="flex items-center gap-3">
      <img
        src={footer.brand.logo}
        alt="Brand Logo"
        className="h-12 w-auto border rounded"
      />
      <button
        onClick={() => {
          const updated = { ...footer, brand: { ...footer.brand, logo: "" } };
          setFooter(updated);
          handleSave(updated);
          toast.error("❌ Logo removed");
        }}
        className="bg-red-600 text-white px-2 py-1 rounded"
      >
        🗑 Remove
      </button>
    </div>
  ) : (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        id="logoUpload"
        name="logo"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const formData = new FormData();
          formData.append("logo", file);

          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/upload/logo`,
              {
                method: "POST",
                body: formData,
              }
            );

            const data = await res.json();

            if (data.url) {
              const updated = {
                ...footer,
                brand: { ...footer.brand, logo: data.url },
              };
              setFooter(updated);
              handleSave(updated);
              toast.success("✅ Logo uploaded successfully");
            }
          } catch (err) {
            console.error(err);
            toast.error("❌ Upload failed");
          }
        }}
      />

      {/* Button to trigger file select */}
      <button
        onClick={() => document.getElementById("logoUpload").click()}
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        ☁ Upload Logo
      </button>
    </>
  )}
</div>
</div>



      {/* ---------- CONTACT INFO ---------- */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="font-semibold flex justify-between items-center">
          Contact Info
          <button
            onClick={() => {
              const newField = `custom${Object.keys(footer.contact || {}).length + 1}`;
              const updated = {
                ...footer,
                contact: { ...footer.contact, [newField]: "" },
              };
              setFooter(updated);
              handleSave(updated);
              toast.success(`➕ Added new contact field: ${newField}`);
            }}
            className="bg-green-600 text-white px-2 py-1 rounded"
          >
            ➕ Add Field
          </button>
        </h3>
        {Object.keys(footer.contact).map((field) => (
          <div key={field} className="flex justify-between items-center gap-4 border-b py-1">
            {renderFieldEditor("contact", field, footer.contact[field])}
          </div>
        ))}
      </div>

      {/* ---------- SOCIAL LINKS ---------- */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="font-semibold">Social Links</h3>
        {footer.socials.map((social, idx) => (
          <div key={idx} className="flex justify-between items-center gap-4 border-b py-1">
            {editing === `social-${idx}` ? (
              <>
                <input
                  type="text"
                  value={tempItem?.url || ""}
                  onChange={(e) => setTempItem({ ...tempItem, url: e.target.value })}
                  className="flex-1 p-2 border rounded"
                  placeholder="Social URL"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const updated = { ...footer };
                      updated.socials[idx] = tempItem;
                      setFooter(updated);
                      setEditing(null);
                      handleSave(updated);
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="bg-gray-400 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="flex-1">
                  {social.name}: {social.url}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(`social-${idx}`);
                      setTempItem(social);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      const updated = { ...footer, socials: footer.socials.filter((_, i) => i !== idx) };
                      setFooter(updated);
                      handleSave(updated);
                      toast.success("🗑 Deleted social link");
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        <button
          onClick={() => {
            const updated = {
              ...footer,
              socials: [...footer.socials, { name: "New", url: "", icon: "" }],
            };
            setFooter(updated);
            handleSave(updated);
            toast.success("➕ Added new social link");
          }}
          className="bg-green-600 text-white px-2 py-1 rounded"
        >
          ➕ Add Social
        </button>
      </div>

      {/* ---------- QUICK LINKS ---------- */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="font-semibold">Quick Links</h3>
        {footer.quickLinks.map((link, idx) => (
          <div key={idx} className="flex justify-between items-center gap-4 border-b py-1">
            {editing === `quick-${idx}` ? (
              <>
                <input
                  type="text"
                  value={tempItem?.label || ""}
                  onChange={(e) => setTempItem({ ...tempItem, label: e.target.value })}
                  className="flex-1 p-2 border rounded"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={tempItem?.href || ""}
                  onChange={(e) => setTempItem({ ...tempItem, href: e.target.value })}
                  className="flex-1 p-2 border rounded"
                  placeholder="Href"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const updated = { ...footer };
                      updated.quickLinks[idx] = tempItem;
                      setFooter(updated);
                      setEditing(null);
                      handleSave(updated);
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="bg-gray-400 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="flex-1">
                  {link.label}: {link.href}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(`quick-${idx}`);
                      setTempItem(link);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      const updated = { ...footer, quickLinks: footer.quickLinks.filter((_, i) => i !== idx) };
                      setFooter(updated);
                      handleSave(updated);
                      toast.success("🗑 Deleted quick link");
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        <button
          onClick={() => {
            const updated = {
              ...footer,
              quickLinks: [...footer.quickLinks, { label: "New Link", href: "#" }],
            };
            setFooter(updated);
            handleSave(updated);
            toast.success("➕ Added new quick link");
          }}
          className="bg-green-600 text-white px-2 py-1 rounded"
        >
          ➕ Add Quick Link
        </button>
      </div>

      {/* ---------- COPYRIGHT ---------- */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="font-semibold">Copyright</h3>
        {editing === "copyright" ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={tempItem || ""}
              onChange={(e) => setTempItem(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={() => {
                const updated = { ...footer, copyrightText: tempItem };
                setFooter(updated);
                setEditing(null);
                handleSave(updated);
              }}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(null)}
              className="bg-gray-400 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p>{footer.copyrightText || "Not set"}</p>
            <button
              onClick={() => {
                setEditing("copyright");
                setTempItem(footer.copyrightText || "");
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
