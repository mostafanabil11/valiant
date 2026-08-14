import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden md:h-[819px]">
      <Image
        src="/images/home/hero.jpg"
        alt="Valiant — The Definition of Now"
        fill
        loading="eager"
        fetchPriority="high"
        className="object-cover"
        sizes="100vw"
      />
      {/* Overlay: darkens the image so white headline/CTA stay legible regardless of the photo's own tones */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/30" />
      <div className="relative z-10 flex flex-col items-center px-margin-mobile text-center">
        <h1 className="mb-6 font-heading text-display-lg-mobile font-bold text-white md:text-display-lg">
          The Definition of Now
        </h1>
        <Link
          href="/men"
          className="bg-primary px-8 py-4 text-button font-medium tracking-[0.05em] text-primary-foreground uppercase transition-colors hover:bg-primary/90"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
