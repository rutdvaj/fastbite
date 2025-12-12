import React from "react";
import { Navbar04 } from "@/app/_components/navbar";
import HeroCarouselFM from "../../_components/herosection";
import HomePageComp from "../../_components/homepage";

export default function HomePage() {
  return (
    <div>
      <div>
        <Navbar04 />
      </div>
      <div>
        <HeroCarouselFM />
      </div>
      <div>
        <HomePageComp />
      </div>
    </div>
  );
}
