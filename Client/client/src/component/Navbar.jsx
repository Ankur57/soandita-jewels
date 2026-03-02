import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import logo from "../assets/soandita-logo.png";

const IMAGE_BASE_URL = "http://localhost:5000";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Search state ──
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ── Debounced search ──
  const fetchResults = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await axios.get(`/products/get?search=${encodeURIComponent(query)}&limit=6`);
      setSearchResults(res.data.products || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchResults(val), 400);
  };

  // ── Close on outside click ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Close on Escape ──
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const linkStyle =
    "text-gray-600 hover:text-black transition-colors text-sm tracking-wide";

  return (
    <>
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700" />

      <nav className="bg-white border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* ── Left: Logo ── */}
            <Link to="/" className="flex-shrink-0">
              <img
                src={logo}
                alt="Soandita Jewels"
                className="h-10 md:h-12 object-contain"
              />
            </Link>

            {/* ── Center: Nav links (desktop) ── */}
            <div className="hidden md:flex items-center gap-7">

              {/* Public Links (shown when NOT logged in) */}
              {!user && (
                <>
                  <Link to="/" className={linkStyle}>
                    Home
                  </Link>
                  <Link to="/shop" className={linkStyle}>
                    Gifts
                  </Link>
                  <Link to="/orders" className={linkStyle}>
                    Bangles
                  </Link>
                  <Link to="/" className={linkStyle}>
                    Earrings
                  </Link>
                  <Link to="/shop" className={linkStyle}>
                    Necklace
                  </Link>
                  <Link to="/orders" className={linkStyle}>
                    Rings
                  </Link>
                </>
              )}

              {/* User links */}
              {user && user.role === "user" && (
                <>
                  <Link to="/" className={linkStyle}>
                    Home
                  </Link>
                  <Link to="/shop" className={linkStyle}>
                    Gifts
                  </Link>
                  <Link to="/orders" className={linkStyle}>
                    Bangles
                  </Link>
                  <Link to="/" className={linkStyle}>
                    Earrings
                  </Link>
                  <Link to="/shop" className={linkStyle}>
                    Necklace
                  </Link>
                  <Link to="/orders" className={linkStyle}>
                    Rings
                  </Link>
                </>
              )}

              {/* Admin links */}
              {user && user.role === "admin" && (
                <>
                  <Link to="/" className={linkStyle}>
                    Home
                  </Link>
                  <Link to="/admin/dashboard" className={linkStyle}>
                    Dashboard
                  </Link>
                  <Link to="/admin/products" className={linkStyle}>
                    Products
                  </Link>
                  <Link to="/admin/returns" className={linkStyle}>
                    Returns
                  </Link>
                </>
              )}
            </div>

            {/* ── Right: Actions ── */}
            <div className="flex items-center gap-3">
              {/* Login / Register (not logged in) */}
              {!user && (
                <Link
                  to="/login"
                  className="hidden md:inline-flex border border-gray-400 text-gray-700 text-xs tracking-wider uppercase px-5 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex border border-gray-400 text-gray-700 text-xs tracking-wider uppercase px-5 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              )}

              {/* ── Search icon + overlay ── */}
              <div className="relative" ref={searchRef}>
                <button
                  className="p-2 text-gray-600 hover:text-black transition-colors"
                  aria-label="Search"
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    if (searchOpen) {
                      setSearchQuery("");
                      setSearchResults([]);
                    }
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {searchOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    )}
                  </svg>
                </button>

                {/* ── Desktop search dropdown (hidden on mobile) ── */}
                {searchOpen && (
                  <div
                    className="hidden md:block absolute right-0 top-full mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    {/* Search input */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by name, category, or SKU…"
                        className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Results area */}
                    <div className="max-h-80 overflow-y-auto">
                      {/* Loading */}
                      {searchLoading && (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                          <span className="ml-2 text-sm text-gray-500">Searching…</span>
                        </div>
                      )}

                      {/* Results */}
                      {!searchLoading && searchResults.length > 0 && (
                        <div>
                          <p className="px-4 pt-3 pb-1 text-xs text-gray-400 uppercase tracking-wider">
                            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                          </p>
                          {searchResults.map((product) => (
                            <Link
                              key={product._id}
                              to={`/product/${product._id}`}
                              onClick={closeSearch}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                            >
                              <img
                                src={
                                  product.images && product.images.length > 0
                                    ? `${IMAGE_BASE_URL}${product.images[0]}`
                                    : "https://via.placeholder.com/60"
                                }
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {product.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {product.categoryId && product.categoryId.name && (
                                    <span className="text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">
                                      {product.categoryId.name}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-400">
                                    SKU: {product.sku}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                                ₹{product.price}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* No results */}
                      {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                        <div className="flex flex-col items-center py-8 text-gray-400">
                          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm">No products found</p>
                          <p className="text-xs mt-1">Try a different name, category, or SKU</p>
                        </div>
                      )}

                      {/* Empty state */}
                      {!searchLoading && !searchQuery.trim() && (
                        <div className="flex flex-col items-center py-8 text-gray-400">
                          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                          <p className="text-sm">Search products</p>
                          <p className="text-xs mt-1">By name, category, or SKU number</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart icon (user only) */}
              {user && user.role === "user" && (
                <Link
                  to="/cart"
                  className="p-2 text-gray-600 hover:text-black transition-colors relative"
                  aria-label="Cart"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </Link>
              )}

              {/* User dropdown / profile */}
              {user && (
                <div className="relative group">
                  <button
                    className="p-2 text-gray-600 hover:text-black transition-colors"
                    aria-label="Account"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                    <p className="px-4 py-1.5 text-xs text-gray-400 uppercase tracking-wider">
                      {user.role === "admin" ? "Admin" : user.name}
                    </p>
                    <hr className="my-1 border-gray-100" />
                    {user.role === "user" && (
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black"
                      >
                        Profile
                      </Link>
                    )}
                    {user.role === "user" && (
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black"
                      >
                        My Orders
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {/* Register link (not logged in, desktop) */}
              {!user && (
                <Link
                  to="/register"
                  className="hidden md:inline-flex p-2 text-gray-600 hover:text-black transition-colors"
                  aria-label="Register"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-black"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile search panel (full-width, shown only on mobile) ── */}
        {searchOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white" ref={searchRef}>
            {/* Search input */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name, category, or SKU…"
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Results area */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Loading */}
              {searchLoading && (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Searching…</span>
                </div>
              )}

              {/* Results */}
              {!searchLoading && searchResults.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs text-gray-400 uppercase tracking-wider">
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                  </p>
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      onClick={closeSearch}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? `${IMAGE_BASE_URL}${product.images[0]}`
                            : "https://via.placeholder.com/60"
                        }
                        alt={product.name}
                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                            ₹{product.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.categoryId && product.categoryId.name && (
                            <span className="text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">
                              {product.categoryId.name}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 truncate">
                            {product.sku}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No results */}
              {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                <div className="flex flex-col items-center py-6 text-gray-400">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No products found</p>
                  <p className="text-xs mt-1">Try a different name, category, or SKU</p>
                </div>
              )}

              {/* Empty state */}
              {!searchLoading && !searchQuery.trim() && (
                <div className="flex flex-col items-center py-6 text-gray-400">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <p className="text-sm">Search products</p>
                  <p className="text-xs mt-1">By name, category, or SKU number</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mobile menu panel ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100 ${mobileOpen ? "max-h-96" : "max-h-0"
            }`}
        >
          <div className="px-6 py-4 flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={linkStyle}
            >
              Home
            </Link>

            {/* User links */}
            {user && user.role === "user" && (
              <>
                <Link
                  to="/shop"
                  onClick={() => setMobileOpen(false)}
                  className={linkStyle}
                >
                  Shop
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className={linkStyle}
                >
                  Cart
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className={linkStyle}
                >
                  My Orders
                </Link>
              </>
            )}

            {/* Admin links */}
            {user && user.role === "admin" && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={linkStyle}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  onClick={() => setMobileOpen(false)}
                  className={linkStyle}
                >
                  Products
                </Link>
                <Link
                  to="/admin/returns"
                  onClick={() => setMobileOpen(false)}
                  className={linkStyle}
                >
                  Returns
                </Link>
              </>
            )}

            <hr className="border-gray-100" />

            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className={linkStyle}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className={linkStyle}
                >
                  Register
                </Link>
              </>
            )}

            {user && (
              <>
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  {user.role === "admin" ? "Admin" : user.name}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="text-left text-gray-600 hover:text-black text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;