import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div className="min-h-screen  flex flex-col">
      <Navbar />
      <main className="flex-1 min-h-0 container mx-auto p-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;