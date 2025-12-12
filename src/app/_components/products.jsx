"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import AddToCartButton from "./addtocart";
import { AlertCircle } from "lucide-react";

export function ProductsPage() {
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
      <section className="w-full px-4 md:px-12 lg:px-20 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Our Products</h1>
          <p className="text-muted-foreground mt-2">
            Authentic Indian flavors, ready in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="w-full h-40 md:h-48" />
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  // Error State
  if (error) {
    return (
      <section className="w-full px-4 md:px-12 lg:px-20 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Our Products</h1>
          <p className="text-muted-foreground mt-2">
            Authentic Indian flavors, ready in minutes.
          </p>
        </div>

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
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <section className="w-full px-4 md:px-12 lg:px-20 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Our Products</h1>
          <p className="text-muted-foreground mt-2">
            Authentic Indian flavors, ready in minutes.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <h2 className="text-2xl font-semibold">No Products Available</h2>
          <p className="text-muted-foreground">
            Check back soon for new items!
          </p>
        </div>
      </section>
    );
  }

  // Main Render
  return (
    <section className="w-full px-4 md:px-12 lg:px-20 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Our Products</h1>
        <p className="text-muted-foreground mt-2">
          Authentic Indian flavors, ready in minutes.
        </p>
      </div>

      {/* Render products by category */}
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div key={category} className="mb-16">
          {/* Category Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground">
              {formatCategoryName(category)}
            </h2>
            <div className="h-1 w-20 bg-primary mt-2 rounded-full" />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="shadow-sm hover:shadow-md transition rounded-lg overflow-hidden h-full flex flex-col">
                  <CardContent className="p-0">
                    <div className="relative w-full h-40 md:h-48">
                      {/* Category Badge on Image */}
                      {product.category && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                          {formatCategoryName(product.category)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col items-start gap-3 p-4 grow">
                    {/* Product Name */}
                    <h3 className="font-semibold text-lg leading-tight">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          product.in_stock > 20
                            ? "bg-green-500"
                            : product.in_stock > 0
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {product.in_stock > 0
                          ? `${product.in_stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    {/* Price */}
                    <p className="text-xl font-bold text-foreground">
                      ₹{product.price}
                    </p>

                    {/* Add to Cart Button */}
                    <div className="w-full mt-auto">
                      <AddToCartButton
                        productId={product.id}
                        disabled={product.in_stock === 0}
                      />
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default ProductsPage;
