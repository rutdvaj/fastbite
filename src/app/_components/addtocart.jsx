"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

export default function AddToCartButton({ productId, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const router = useRouter();

  const handleAddToCart = async () => {
    try {
      setLoading(true);

      // Try to add to cart - let the API handle auth check
      const res = await fetch("/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, qty: 1 }),
      });

      const result = await res.json();

      console.log("API Response:", result); // DEBUG
      console.log("Status:", res.status); // DEBUG

      // If unauthorized (401), redirect to login
      if (res.status === 401 || result.error === "Not authenticated") {
        router.push("/pages/auth/login");
        return;
      }

      if (!res.ok) {
        alert(result.error || "Failed to add to cart");
        return;
      }

      if (result.success) {
        console.log("✅ Added to cart (DB)");
        setInCart(true);
        setQuantity(1);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, qty: 1 }),
      });

      const result = await res.json();

      if (res.status === 401 || result.error === "Not authenticated") {
        router.push("/pages/auth/login");
        return;
      }

      if (result.success) {
        setQuantity((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error incrementing cart:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/cart/subtract", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, qty: 1 }),
      });

      const data = await res.json();

      if (res.status === 401 || data.error === "Not authenticated") {
        router.push("/pages/auth/login");
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to subtract");
        return;
      }

      // If item was removed (qty <= 0)
      if (data.removed) {
        setInCart(false);
        setQuantity(0);
      } else {
        setQuantity(data.quantity);
      }
    } catch (error) {
      console.error("Error decrementing cart:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Show Add to Cart button if not in cart
  if (!inCart) {
    return (
      <Button
        onClick={handleAddToCart}
        className="w-full cursor-pointer"
        disabled={disabled || loading}
      >
        {loading ? "Adding..." : "Add to Cart"}
      </Button>
    );
  }

  // Show quantity controls if in cart
  return (
    <div className="flex items-center justify-center gap-3 w-full cursor-pointer">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 cursor-pointer"
        onClick={handleDecrement}
        disabled={loading}
      >
        <Minus size={16} />
      </Button>

      <span className="font-semibold text-lg min-w-7.5 text-center">
        {quantity}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={handleIncrement}
        disabled={loading}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}
