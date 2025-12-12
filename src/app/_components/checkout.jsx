"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, User, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // Fetch cart and addresses
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch cart
      const cartRes = await fetch("/api/cart/get", {
        method: "GET",
        credentials: "include",
      });
      const cartData = await cartRes.json();

      // Fetch addresses
      const addressRes = await fetch("/api/address/get");
      const addressData = await addressRes.json();

      if (cartData.items) {
        setCart(cartData.items);
      } else {
        setError(cartData.error || "Failed to load cart");
        setLoading(false);
        return;
      }

      if (addressData.success && addressData.data) {
        setAddresses(addressData.data);

        // Auto-select default address if available
        const defaultAddr = addressData.data.find((addr) => addr.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (addressData.data.length > 0) {
          setSelectedAddressId(addressData.data[0].id);
        } else {
          // No saved addresses, show new address form
          setUseNewAddress(true);
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product_price * item.qty,
    0
  );
  const shipping = subtotal > 299 ? 0 : 49;
  const total = subtotal + shipping;

  // Get selected address details
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId
  );

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle new address submission
  const saveNewAddress = async () => {
    try {
      const response = await fetch("/api/address/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newAddress.fullName,
          phone: newAddress.phone,
          line1: newAddress.line1,
          line2: newAddress.line2,
          city: newAddress.city,
          state: newAddress.state,
          postalCode: newAddress.postalCode,
          isDefault: addresses.length === 0, // Make default if first address
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        return data.data.id; // Return the new address ID
      } else {
        throw new Error(data.error || "Failed to save address");
      }
    } catch (err) {
      throw err;
    }
  };

  // Validate form before payment
  const validateCheckout = () => {
    if (useNewAddress) {
      if (
        !newAddress.fullName ||
        !newAddress.phone ||
        !newAddress.line1 ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.postalCode
      ) {
        toast.error("Incomplete Address", {
          description: "Please fill in all required address fields",
        });
        return false;
      }
    } else if (!selectedAddressId) {
      toast.error("No Address Selected", {
        description: "Please select a delivery address",
      });
      return false;
    }

    return true;
  };

  // Handle payment
  const handlePayment = async () => {
    // Validate form
    if (!validateCheckout()) {
      return;
    }

    setProcessingPayment(true);

    try {
      // If using new address, save it first
      let addressIdToUse = selectedAddressId;
      if (useNewAddress) {
        addressIdToUse = await saveNewAddress();
        if (!addressIdToUse) {
          throw new Error("Failed to save address");
        }
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Error", {
          description: "Failed to load payment gateway. Please try again.",
        });
        setProcessingPayment(false);
        return;
      }
      console.log("🚀 Creating order with:", {
        addressId: addressIdToUse,
        totalAmount: total,
      });

      // Create order on backend
      const orderResponse = await fetch("/api/payments/createorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This ensures cookies are sent
        body: JSON.stringify({
          addressId: addressIdToUse,
          totalAmount: total,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("Order creation failed:", errorData);
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();

      // Razorpay options - UPI focused
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Your Store Name", // Replace with your store name
        description: "Order Payment",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderData.dbOrderId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              toast.success("Payment Successful!", {
                description: "Redirecting to order confirmation...",
              });

              // Redirect to success page after a short delay
              setTimeout(() => {
                router.push(`/pages/success`); // No orderId needed anymore
              }, 1500);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment Verification Failed", {
              description: "Please contact support with your payment details",
            });
            setProcessingPayment(false); // Re-enable the button on error
          }
        },
        prefill: {
          name: useNewAddress
            ? newAddress.fullName
            : selectedAddress?.full_name || "",
          contact: useNewAddress
            ? newAddress.phone
            : selectedAddress?.phone || "",
        },
        method: {
          upi: true, // Enable only UPI
          card: false, // Disable cards
          netbanking: false, // Disable netbanking
          wallet: false, // Disable wallets
        },
        theme: {
          color: "#000000", // Customize to match your brand
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            toast.info("Payment Cancelled", {
              description: "You cancelled the payment process",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment Failed", {
        description:
          error.message || "Failed to initiate payment. Please try again.",
      });
      setProcessingPayment(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="w-full px-4 md:px-12 lg:px-20 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full px-4 md:px-12 lg:px-20 py-12">
        <div className="text-center py-20">
          <p className="text-lg text-red-500">Error: {error}</p>
          <Button className="mt-4" asChild>
            <Link href="/pages/products">Go to Products</Link>
          </Button>
        </div>
      </section>
    );
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <section className="w-full px-4 md:px-12 lg:px-20 py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart before checking out
          </p>
          <Button size="lg" asChild>
            <Link href="/pages/products">Shop Products</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 md:px-12 lg:px-20 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      {/* MOBILE: 1 column | DESKTOP: 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN — SHIPPING */}
        <div className="lg:col-span-2 space-y-6">
          {/* SHIPPING FORM */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </div>

              {/* SELECT SAVED ADDRESS */}
              {!useNewAddress && addresses.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <Label>Select Delivery Address</Label>
                    <Select
                      value={selectedAddressId}
                      onValueChange={setSelectedAddressId}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id}>
                            <div className="flex items-center gap-2">
                              <span>{addr.full_name}</span>
                              {addr.is_default && (
                                <span className="text-xs text-primary">
                                  (Default)
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* DISPLAY SELECTED ADDRESS */}
                  {selectedAddress && (
                    <Card className="border bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {selectedAddress.full_name}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                              <p>{selectedAddress.line1}</p>
                              {selectedAddress.line2 && (
                                <p>{selectedAddress.line2}</p>
                              )}
                              <p>
                                {selectedAddress.city}, {selectedAddress.state}{" "}
                                {selectedAddress.postal_code}
                              </p>
                              {selectedAddress.phone && (
                                <p className="mt-1">
                                  Phone: {selectedAddress.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => setUseNewAddress(true)}
                  >
                    + Add a new address
                  </Button>
                </div>
              )}

              {/* NEW ADDRESS FORM */}
              {useNewAddress && (
                <div className="space-y-4">
                  {addresses.length > 0 && (
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setUseNewAddress(false)}
                    >
                      ← Use saved address
                    </Button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* FULL NAME */}
                    <div className="md:col-span-2">
                      <Label>Full Name *</Label>
                      <Input
                        placeholder="John Doe"
                        className="mt-1"
                        value={newAddress.fullName}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* PHONE */}
                    <div className="md:col-span-2">
                      <Label>Phone Number *</Label>
                      <Input
                        placeholder="+91 98765 43210"
                        className="mt-1"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* LINE 1 */}
                    <div className="md:col-span-2">
                      <Label>Address Line 1 *</Label>
                      <Input
                        placeholder="House No, Street, Area"
                        className="mt-1"
                        value={newAddress.line1}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            line1: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* LINE 2 */}
                    <div className="md:col-span-2">
                      <Label>Address Line 2</Label>
                      <Input
                        placeholder="Landmark, Apartment Name (Optional)"
                        className="mt-1"
                        value={newAddress.line2}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            line2: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* CITY */}
                    <div>
                      <Label>City *</Label>
                      <Input
                        placeholder="Mumbai"
                        className="mt-1"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* STATE */}
                    <div>
                      <Label>State *</Label>
                      <Input
                        placeholder="Maharashtra"
                        className="mt-1"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* POSTAL CODE */}
                    <div className="md:col-span-2">
                      <Label>Postal Code *</Label>
                      <Input
                        placeholder="400001"
                        className="mt-1"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            postalCode: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PAYMENT INFO CARD */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">UPI Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll be able to pay via UPI (Google Pay, PhonePe, Paytm,
                    etc.) after clicking "Place Order". A QR code will be
                    generated for easy payment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN — ORDER SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="flex items-center gap-4"
                  >
                    <div className="grow">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.qty}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₹{item.product_price * item.qty}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <Button
                className="w-full mt-3 text-lg py-6"
                onClick={handlePayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secured by Razorpay • UPI Payment
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default CheckoutPage;
