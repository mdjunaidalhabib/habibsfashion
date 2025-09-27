"use client";
import "./globals.css";
import { CartProvider } from "../../context/CartContext";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/home/footer";
import { UserProvider } from "../../context/UserContext";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
            <UserProvider>

        <CartProvider>
         <Navbar />
          {children}
          <Footer />
        </CartProvider>
            </UserProvider>

      </body>
    </html>
  );
}
