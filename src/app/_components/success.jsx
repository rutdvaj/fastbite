"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SuccessPage() {
  return (
    <section className="w-full px-4 md:px-12 lg:px-20 py-20 flex justify-center items-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center space-y-6"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
        </motion.div>

        {/* Heading */}
        <h1 className="text-4xl font-bold">Order Confirmed!</h1>

        {/* Message */}
        <p className="text-muted-foreground text-lg">
          Thank you for your purchase. Your order has been successfully placed
          and you'll receive a confirmation email shortly.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-8">
          <Button asChild size="lg" className="w-full">
            <Link href="/pages/products">Continue Shopping</Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/pages/orders">View My Orders</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
