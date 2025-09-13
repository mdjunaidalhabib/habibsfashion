"use client";
import "./globals.css";
import { CartProvider } from "../../context/CartContext";
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/footer";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
