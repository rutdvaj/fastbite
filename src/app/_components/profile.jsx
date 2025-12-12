"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, MapPin, Phone, User } from "lucide-react";
import LogoutButton from "./logoutbtn";
import { Logout } from "../pages/auth/logoutactions";
import { useRouter } from "next/navigation";

export function ProfilePage() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserAndAddresses();
  }, []);

  const fetchUserAndAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/address/get");

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        setAddresses(result.data);
      } else {
        setError("Failed to load data");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while loading your profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-500 text-center">{error}</p>
            <Button onClick={fetchUserAndAddresses} className="w-full mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="w-full px-4 md:px-12 lg:px-20 py-10 space-y-10">
      <h1 className="text-3xl font-bold">My Profile</h1>

      {/* USER INFO */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg font-medium">
            {addresses.length > 0 && addresses[0].full_name
              ? addresses[0].full_name
              : "User"}
          </p>
          <p className="text-muted-foreground">{user?.email}</p>

          <Button className="mt-2 w-full md:w-auto">Edit Profile</Button>
        </CardContent>
      </Card>

      {/* ORDER HISTORY */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">No past orders.</p>
          {/* When you integrate Supabase orders, map orders here */}
        </CardContent>
      </Card>

      {/* SAVED ADDRESSES */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-muted-foreground">No saved addresses.</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <Card key={address.id} className="border">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Name and Default Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {address.full_name}
                          </span>
                        </div>
                        {address.is_default && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>

                      {/* Address Lines */}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p>{address.line1}</p>
                          {address.line2 && <p>{address.line2}</p>}
                          <p>
                            {address.city}, {address.state}{" "}
                            {address.postal_code}
                          </p>
                          <p>{address.country}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      {address.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {address.phone}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Button
            className="w-full md:w-auto"
            onClick={() => router.push("/pages/onboarding")}
          >
            Add New Address
          </Button>
        </CardContent>
      </Card>

      {/* LOGOUT */}
      <div className="flex justify-end">
        <LogoutButton action={Logout} />
      </div>
    </section>
  );
}

export default ProfilePage;
