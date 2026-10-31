import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
