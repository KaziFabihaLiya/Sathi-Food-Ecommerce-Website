/* eslint-disable @next/next/no-img-element */
import { IMG } from "@/lib/images";
const photos = IMG.gallery;

export default function Gallery() {
  return (
    <section id="photos" className="bg-parchment py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow">Real product photos</p>
        <h2 className="mt-3 font-serif text-4xl font-semibold text-forest md:text-5xl">What you&apos;ll receive.</h2>
        <p className="mt-4 max-w-xl text-ink/55">Unedited photos of Shathi Foods ghee, shown in full without image cropping.</p>
        <ul className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {photos.map((src, i) => (
            <li key={src} className="w-[70%] shrink-0 snap-center sm:w-[40%] lg:w-auto">
              <img src={src} alt={`Shathi Foods ghee jar, photo ${i + 1}`} loading="lazy" className="h-auto w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
