import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: ["Audio", "Mobile", "Computing", "Wearables", "New arrivals", "Limited edits"],
  },
  {
    title: "ShoppyGo",
    links: ["Our story", "Atelier", "Sourcing", "Press", "Careers"],
  },
  {
    title: "Care",
    links: ["Concierge", "Shipping", "Returns", "Warranty", "Contact"],
  },
];

export function PageFooter() {
  return (
    <footer className="border-t border-border bg-background/60">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="font-serif text-4xl text-foreground">
              ShoppyGo<span className="text-gold italic">.</span>
            </span>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Receive private drops, editorial buying guides, and first access to limited catalog releases.
            </p>
            <form className="mt-8 flex max-w-md border border-border transition-colors focus-within:border-gold">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="button"
                className="bg-gold px-6 text-[10px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold">{column.title}</h4>
              <ul className="mt-6 space-y-3">
                {column.links.map((item) => (
                  <li key={item}>
                    <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:mt-20 md:flex-row">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Copyright 2026 ShoppyGo. Crafted for modern commerce.
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/" className="transition-colors hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}