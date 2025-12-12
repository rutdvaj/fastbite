"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    image: "/assets/img1.png",
    title: "Serums",
  },
  {
    id: 2,
    image: "/assets/img2.png",
    title: "Moisturizers",
  },
  {
    id: 3,
    image: "/assets/img3.jpeg",
    title: "Facewash",
  },
  {
    id: 4,
    image: "/assets/img4.jpg",
    title: "Essentials",
  },
];

export function HeroCarouselFM() {
  const [index, setIndex] = useState(0);

  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-black">
      {/* SLIDES */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[index].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={slides[index].image}
              alt={slides[index].title}
              fill
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT OVERLAY PANEL */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2  p-6 rounded-xl shadow-lg w-48 md:w-64">
        <h2 className="text-2xl font-bold mb-3  text-white">
          {slides[index].title}
        </h2>
        <Button className="w-full">Shop Now</Button>
      </div>

      {/* DOTS */}
      <div className="absolute bottom-4 w-full flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              i === index ? "bg-white" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarouselFM;
