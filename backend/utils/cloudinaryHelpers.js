import cloudinary from "./cloudinary.js";

// Helper: Delete Cloudinary image from URL
export const deleteFromCloudinary = async (url) => {
  if (!url) return;
  try {
    const publicId = url.split("/").slice(-2).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("⚠️ Failed to delete image:", err);
  }
};
