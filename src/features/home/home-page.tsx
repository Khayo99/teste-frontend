import { HomeCatalog } from "./components/home-catalog";
import { HomeDiscovery } from "./components/home-discovery";
import { HomeHero } from "./components/home-hero";

export function HomePage() {
  return (
    <>
      {/* -mt-16 compensates the layout's gap-24 (96px) to reproduce the
          design's tighter gap-8 (32px) between the header and the hero. */}
      <div className="-mt-16">
        <HomeHero />
      </div>
      <HomeCatalog />
      <HomeDiscovery />
    </>
  );
}
