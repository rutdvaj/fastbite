import React from "react";
import CheckoutPage from "../../_components/checkout";
import { Navbar04 } from "@/app/_components/navbar";

function page() {
  return (
    <div>
      <div>
        <Navbar04 />
      </div>
      <div>
        <CheckoutPage />
      </div>
    </div>
  );
}

export default page;
