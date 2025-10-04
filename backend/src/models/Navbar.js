import mongoose from "mongoose";

const NavbarSchema = new mongoose.Schema({
  brand: {
    name: { type: String, default: "Brand Name" },
    logo: { type: String, default: "" }, // Cloudinary URL
  },
  updatedAt: { type: Date, default: Date.now }
});

const Navbar = mongoose.models.Navbar || mongoose.model("Navbar", NavbarSchema);
export default Navbar;
