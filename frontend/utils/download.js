export async function downloadReceipt(orderId, order = null) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/receipt`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!res.ok) {
      console.error("❌ Failed to fetch receipt");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    // ✅ custom filename (brand + orderId)
    const fileName = `HabibsFashion-${order?.orderId || orderId}.pdf`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("🔥 Download error:", err);
  }
}
