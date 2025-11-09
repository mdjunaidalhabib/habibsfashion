import "./globals.css";
import { CartProvider } from "../../context/CartContext";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/home/footer";
import { UserProvider } from "../../context/UserContext";

export const metadata = {
  title: "Habib's Fashion",
  description: "Habib's Fashion store",
  icons: {
    icon: "/Logo-Rounted.ico",
    shortcut: "/Logo-Rounted.ico",
    apple: "/Logo-Rounted.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* পুরো পেজকে flex container বানানো */}
      <body className="flex flex-col min-h-screen bg-gray-50">
        <UserProvider>
          <CartProvider>
            <Navbar />
            {/* মূল কনটেন্ট বাড়বে, footer নিচে ঠেলে দেবে */}
            <main className="flex-grow bg-pink-50">{children}</main>
            <Footer />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
