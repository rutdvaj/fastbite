"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // 1️⃣ Get the current session user
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();

      if (!sessionData?.user?.id) {
        setLoading(false);
        setErrorMsg("Session expired. Please login again.");
        console.log(sessionData?.user?.id);
        return router.push("/pages/auth/signup");
      }

      const user_id = sessionData.user.id;

      // 2️⃣ Prepare payload
      const payload = {
        user_id,
        full_name: form.full_name,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        country: form.country,
      };

      // 3️⃣ Send to API
      const response = await fetch("/api/address/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setErrorMsg(data.error || "Failed to save address.");
        return;
      }

      // 4️⃣ Success → Redirect
      router.push("/pages/home");
    } catch (err) {
      setErrorMsg("Unexpected error. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full px-4 md:px-12 lg:px-20 py-12 flex justify-center">
      <Card className="w-full max-w-2xl shadow-sm">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center">
            Complete Your Profile
          </h1>
          <p className="text-center text-muted-foreground text-sm -mt-3">
            Tell us a few details to finish setting up your account.
          </p>

          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div className="md:col-span-2">
              <Label>Full Name</Label>
              <Input
                name="full_name"
                placeholder="John Doe"
                value={form.full_name}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Phone Number</Label>
              <Input
                name="phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Address Line 1</Label>
              <Input
                name="line1"
                placeholder="House No, Street, Area"
                value={form.line1}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Address Line 2</Label>
              <Input
                name="line2"
                placeholder="Landmark / Apartment (Optional)"
                value={form.line2}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label>City</Label>
              <Input
                name="city"
                placeholder="Mumbai"
                value={form.city}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label>State</Label>
              <Input
                name="state"
                placeholder="Maharashtra"
                value={form.state}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Postal Code</Label>
              <Input
                name="postal_code"
                placeholder="400001"
                value={form.postal_code}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full text-lg py-6 mt-2"
            disabled={loading}
          >
            {loading ? "Saving..." : "Finish Setup"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
