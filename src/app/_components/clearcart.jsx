"use client";

import { useState } from "react";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClearCartIcon({ onCleared }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const clearCart = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/cart/remove", {
        method: "DELETE",
      });

      // If the backend returned HTML instead of JSON, this is where it breaks.
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to clear cart");
      } else {
        onCleared?.();
        alert("Cart cleared!");
        router.refresh(); // refresh cart list
      }
    } catch (err) {
      console.error("Clear cart error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Trash
      className="h-5 w-5 cursor-pointer text-red-600"
      onClick={clearCart}
    />
  );
}
