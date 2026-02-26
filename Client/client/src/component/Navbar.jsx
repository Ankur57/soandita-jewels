import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-xl font-bold">
          Soandita Jewels
        </Link>

        <div className="space-x-6">
          <Link to="/shop">Shop</Link>
        </div>
        <div className="space-x-6">
          <Link to="/cart">Cart</Link>
        </div>
        {user && <Link to="/orders">Orders</Link>}

        {user ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}

        {user?.role === "admin" && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/returns">Returns</Link>
            <Link to="/admin/add-product">Add Product</Link>
            <Link to="/admin/products">Products</Link>
          </>
        )}

      </div>
    </nav>
  );
}

export default Navbar;