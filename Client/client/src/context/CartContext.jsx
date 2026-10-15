import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (!user || user.role !== "user") {
      setCartCount(0);
      return;
    }
    try {
      const res = await axios.get("/cart");
      const items = res.data?.items || [];
      // Sum up quantities across all cart items
      const total = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, [user]);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount: fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
