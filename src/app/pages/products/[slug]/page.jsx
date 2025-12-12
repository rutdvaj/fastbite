import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import img1 from "../../../../../public/assets/img1.png";
import { Navbar04 } from "@/app/_components/navbar";
import AddToCartButton from "../../../_components/addtocart";

// Fetch product from your own API layer
async function getProduct(slug) {
  const baseUrl = "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/products/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = await res.json();
  return json.product;
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return notFound();

  return (
    <div>
      <div>
        <Navbar04 />
      </div>
      <section className="w-full px-4 md:px-12 lg:px-20 py-10">
        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* IMAGE SIDE */}
          <Card className="rounded-lg shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="relative w-full h-[300px] md:h-[450px]">
                <Image
                  src={img1}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          {/* DETAILS SIDE */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

            {/* Price */}
            <p className="text-2xl md:text-3xl font-semibold text-primary">
              ₹{product.price}
            </p>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Stock */}
            {product.in_stock > 0 ? (
              <p className="text-green-600 font-medium">
                In Stock ({product.in_stock} available)
              </p>
            ) : (
              <p className="text-red-600 font-medium">Out of Stock</p>
            )}

            {/* Add to Cart */}
            <AddToCartButton productId={product.id} />
          </div>
        </div>

        {/* ADDITIONAL DETAILS */}
        <div className="mt-16 space-y-4 max-w-3xl">
          <h2 className="text-2xl font-semibold">About This Product</h2>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      </section>
    </div>
  );
}
