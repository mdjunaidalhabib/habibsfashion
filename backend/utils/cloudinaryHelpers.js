import cloudinary from "./cloudinary.js";

// Cloudinary থেকে ছবি ও ফোল্ডার ডিলিট করার ফাংশন
export const deleteFromCloudinary = async (imageUrl, folder = "products") => {
  try {
    const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];

    // ছবি ডিলিট
    await cloudinary.uploader.destroy(`${folder}/${publicId}`);

    // ✅ Recursive folder delete function
    const deleteFolderIfEmpty = async (folderPath) => {
      const { resources, folders } = await cloudinary.api.resources({
        type: "upload",
        prefix: folderPath + "/",
        max_results: 1,
      });

      // ফোল্ডার খালি কিনা দেখো
      const isEmpty = resources.length === 0 && (!folders || folders.length === 0);
      if (isEmpty) {
        await cloudinary.api.delete_folder(folderPath);
        console.log(`🗂️ Folder deleted: ${folderPath}`);

        // যদি nested folder হয় (যেমন products/gallery)
        const parent = folderPath.includes("/")
          ? folderPath.split("/").slice(0, -1).join("/")
          : null;
        if (parent) {
          await deleteFolderIfEmpty(parent); // recursively parent ফোল্ডারও চেক করো
        }
      } else {
        console.log(`✅ Folder not empty: ${folderPath}`);
      }
    };

    // এই ফোল্ডার চেক করা শুরু করো
    await deleteFolderIfEmpty(folder);
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
  }
};
