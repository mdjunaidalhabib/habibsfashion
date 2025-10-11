import "./globals.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export const metadata = {
  title: "Admin Panel",
  description: "Admin section for managing the application",
  icons: {
    icon: "/Logo-Rounted.ico",
    shortcut: "/Logo-Rounted.ico",
    apple: "/Logo-Rounted.ico",
  },
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />

          <div className="flex-1 flex flex-col">
            <Header />
            <main className="p-2 sm:p-4 overflow-auto flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
