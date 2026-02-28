import Link from "next/link";
import { Fish } from "lucide-react";

const footerLinks = {
  Marketplace: [
    "All Products",
    "Tropical Fish",
    "Aquariums",
    "Accessories",
    "Live Plants",
  ],
  Company: ["About Us", "Careers", "Press", "Blog", "Contact"],
  Support: ["Help Center", "Shipping Info", "Returns", "Live Chat", "FAQs"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Fish className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold  text-background">
                MultiAqua
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-background/60 max-w-sm">
              Vietnam&apos;s premier aquarium marketplace connecting passionate
              sellers with aquarium enthusiasts nationwide.
            </p>
            <div className="flex gap-3 mt-6">
              {["Facebook", "YouTube", "Instagram"].map((social) => (
                <button
                  key={social}
                  className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center text-background/60 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span className="text-xs font-medium">{social[0]}</span>
                  <span className="sr-only">{social}</span>
                </button>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-background mb-4">
                {category}
              </h3>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-background/50 hover:text-primary transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
          <p className="text-xs text-background/40">
            2026 MultiAqua. All rights reserved.
          </p>
          <p className="text-xs text-background/40">
            Made with care for the aquarium community
          </p>
        </div>
      </div>
    </footer>
  );
}
