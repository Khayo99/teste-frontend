import { useState } from "react";
import { ZoomIn } from "lucide-react";

export function NftGallery({
  gallery,
  name,
}: {
  gallery: string[];
  name: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallery[activeIndex] ?? gallery[0];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      <div className="flex gap-4 overflow-x-auto lg:w-[100px] lg:flex-col lg:overflow-visible">
        {gallery.map((image, index) => (
          <button
            aria-label={`Ver imagem ${index + 1} de ${name}`}
            aria-pressed={activeIndex === index}
            className={`size-[100px] shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${
              activeIndex === index
                ? "border-text-accent"
                : "border-transparent hover:border-border"
            }`}
            key={`${image}-${index}`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <img alt="" className="size-full object-cover" src={image} />
          </button>
        ))}
      </div>
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-surface-card">
        <img
          alt={`Imagem principal de ${name}`}
          className="aspect-square size-full object-cover"
          src={activeImage}
        />
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 grid size-[30px] place-items-center rounded-full bg-ink/70 text-text-primary"
        >
          <ZoomIn className="size-icon-sm" strokeWidth={1.5} />
        </span>
      </div>
    </div>
  );
}
