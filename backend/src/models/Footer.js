import mongoose from "mongoose";

// Sub-schemas
const SocialSchema = new mongoose.Schema({
  name: String,
  url: String,
  icon: String,
});

const QuickLinkSchema = new mongoose.Schema({
  label: String,
  href: String,
});

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
});

// Main Footer Schema
const FooterSchema = new mongoose.Schema({
  brand: {
    title: String,
    logo: String, // URL
    logoPublicId: String, // ✅ cloudinary public_id এখানে সেভ হবে
    about: String,
  },
  socials: [SocialSchema],
  quickLinks: [QuickLinkSchema],
  categories: [CategorySchema],
  contact: {
    address: String,
    phone: String,
    email: String,
    website: String,
  },
  copyrightText: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

const Footer = mongoose.models.Footer || mongoose.model("Footer", FooterSchema);

export default Footer;
