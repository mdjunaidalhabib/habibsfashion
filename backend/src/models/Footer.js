import mongoose from "mongoose";

// Sub-schemas
const SocialSchema = new mongoose.Schema({
  name: String,
  url: String,
  icon: String // optional: store icon name (FaFacebookF etc) or svg path
});

const QuickLinkSchema = new mongoose.Schema({
  label: String,
  href: String
});

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String
});

// Main Footer Schema
const FooterSchema = new mongoose.Schema({
  brand: {
    title: String,
    logo: String, // path or URL
    about: String,
  },
  socials: [SocialSchema],
  quickLinks: [QuickLinkSchema],
  categories: [CategorySchema],
  contact: {
    address: String,
    phone: String,
    email: String,
    website: String
  },
  copyrightText: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

// ✅ Create model (check if already exists for hot reload)
const Footer = mongoose.models.Footer || mongoose.model("Footer", FooterSchema);

// ✅ Export default
export default Footer;
