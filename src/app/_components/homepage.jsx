"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AddToCartButton from "./addtocart";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function HomePageComp() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/products/get");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || "uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  // Format category name for display
  const formatCategoryName = (category) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Loading State
  if (loading) {
    return (
      <div>
        <section className="px-4 md:px-12 lg:px-20 py-10 space-y-16">
          {[...Array(3)].map((_, catIndex) => (
            <div key={catIndex} className="space-y-6">
              {/* Category Title Skeleton */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-24" />
              </div>

              {/* Product Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card
                    key={i}
                    className="shadow-sm rounded-lg overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <Skeleton className="w-full h-40 md:h-48" />
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2 p-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div>
        <section className="px-4 md:px-12 lg:px-20 py-10">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <h2 className="text-2xl font-semibold">Failed to Load Products</h2>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
              Try Again
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div>
        <section className="px-4 md:px-12 lg:px-20 py-10">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <h2 className="text-2xl font-semibold">No Products Available</h2>
            <p className="text-muted-foreground">
              Check back soon for new items!
            </p>
          </div>
        </section>
      </div>
    );
  }

  // Main Render
  return (
    <div>
      {/* CATEGORY SECTIONS */}
      <section className="px-4 md:px-12 lg:px-20 py-10 space-y-16">
        {Object.entries(groupedProducts).map(([category, catProducts]) => (
          <div key={category} className="space-y-6">
            {/* CATEGORY TITLE */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl md:text-3xl font-bold">
                {formatCategoryName(category)}
              </h2>

              <Link href="/products">
                <Button variant="ghost">View All</Button>
              </Link>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {catProducts.slice(0, 4).map((product) => (
                <Card
                  key={product.id}
                  className="shadow-sm hover:shadow-md transition rounded-lg overflow-hidden"
                >
                  {/* IMAGE */}
                  <CardContent className="p-0">
                    <div className="relative w-full h-40 md:h-48">
                      {/* Category Badge */}
                      {product.category && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                          {formatCategoryName(product.category)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  {/* DETAILS */}
                  <CardFooter className="flex flex-col items-start gap-2 p-4">
                    <div className="w-full flex justify-between items-center">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>

                    <p className="text-xl font-bold">₹{product.price}</p>

                    <AddToCartButton
                      productId={product.id}
                      disabled={product.in_stock === 0}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default HomePageComp;
