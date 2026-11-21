const items = [
  { n: "01", title: "100% Pure", text: "No preservatives or artificial flavouring." },
  { n: "02", title: "Small-batch made", text: "Carefully prepared for a rich, familiar taste." },
  { n: "03", title: "Cash on delivery", text: "Order with confidence anywhere in Bangladesh." },
];

export default function TrustStrip() {
  return (
    <section className="bg-forest text-cream">
      <ul className="mx-auto grid max-w-7xl gap-8 px-5 py-9 md:grid-cols-3 md:gap-0 md:px-8">
        {items.map((i, idx) => (
          <li key={i.n} className={`flex items-start gap-4 md:px-8 ${idx > 0 ? "md:border-l md:border-cream/10" : "md:pl-0"}`}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-sm font-bold text-forest">{i.n}</span>
            <div>
              <h3 className="font-serif text-xl font-semibold">{i.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-cream/65">{i.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
