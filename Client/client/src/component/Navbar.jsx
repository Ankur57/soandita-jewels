import { Link } from "react-router-dom";

function Navbar() {
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
      </div>
    </nav>
  );
}

export default Navbar;