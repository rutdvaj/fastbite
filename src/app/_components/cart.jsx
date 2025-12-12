"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ClearCartButton from "../_components/clearcart";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Add item to cart (increment quantity)
  const addItem = async (productId) => {
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, qty: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add");
        return;
      }

      // Update qty in state
      setCart((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // Subtract cart function
  const subtractItem = async (productId) => {
    try {
      const res = await fetch("/api/cart/subtract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, qty: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to subtract");
        return;
      }

      // If item was removed (qty <= 0)
      if (data.removed) {
        setCart((prev) => prev.filter((item) => item.product_id !== productId));
      } else {
        // Update qty in state
        setCart((prev) =>
          prev.map((item) =>
            item.product_id === productId
              ? { ...item, qty: data.quantity }
              : item
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart/get", {
        method: "GET",
        credentials: "include",
      });

      const json = await res.json();

      if (json.items) {
        setCart(json.items);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <div className="p-8">Loading cart...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  // CALCULATE PRICES
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product_price * item.qty,
    0
  );
  const shipping = subtotal > 299 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <section className="w-full px-4 md:px-12 lg:px-20 py-10 space-y-8">
      {/* Header with Clear Cart button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        {cart.length > 0 && <ClearCartButton onCleared={() => setCart([])} />}
      </div>

      {/* EMPTY STATE */}
      {cart.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
          <Button size="lg" asChild>
            <Link href="/pages/products">Shop Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT SIDE — CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <Card key={item.cart_item_id} className="shadow-sm">
                <CardContent className="p-4 flex gap-4">
                  {/* PRODUCT DETAILS */}
                  <div className="flex flex-col justify-between w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/product/${item.product_slug}`}>
                          <p className="font-semibold text-lg hover:underline">
                            {item.product_name}
                          </p>
                        </Link>
                        <p className="text-muted-foreground text-sm">
                          ₹{item.product_price}
                        </p>
                      </div>
                    </div>

                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => subtractItem(item.product_id)}
                      >
                        <Minus size={14} />
                      </Button>

                      <span className="font-medium text-lg">{item.qty}</span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => addItem(item.product_id)}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* RIGHT SIDE — ORDER SUMMARY */}
          <Card className="shadow-sm h-fit">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">Order Summary</h2>

              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <Button className="w-full text-lg py-6" asChild>
                <Link href="/pages/checkout">Proceed to Checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
