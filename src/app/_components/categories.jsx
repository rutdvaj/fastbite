"use client";

import Image from "next/image";
import { Card, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const categories = [
  {
    id: 1,
    title: "North Indian Premixes",
    image: "/assets/cat-northindian.jpg",
    description: "Classic restaurant-style flavors ready in minutes.",
  },
  {
    id: 2,
    title: "Cereal Premixes",
    image: "/assets/cat-cereal.jpg",
    description: "Healthy, nutritious, and perfect for your daily breakfast.",
  },
  {
    id: 3,
    title: "Cake Premixes",
    image: "/assets/cat-cake.jpg",
    description: "Delicious bakery-style cakes with zero effort!",
  },
];

export function CategoriesPage() {
  return (
    <section className="w-full px-4 md:px-12 lg:px-20 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Categories</h1>
        <p className="text-muted-foreground mt-2">
          Explore our wide range of authentic Indian premixes.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="shadow-sm hover:shadow-md transition rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full h-48 md:h-60">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col items-start gap-3 p-5">
                <h3 className="font-semibold text-xl">{category.title}</h3>
                <p className="text-muted-foreground">{category.description}</p>

                <Button className="w-full mt-2">Explore</Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
export default CategoriesPage;
