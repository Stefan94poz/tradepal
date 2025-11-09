import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
    marketplace: [
      { name: "Browse Products", href: "/products" },
      { name: "Find Suppliers", href: "/suppliers" },
      { name: "Partner Directory", href: "/partners" },
      { name: "Categories", href: "/categories" },
    ],
    sellers: [
      { name: "Become a Seller", href: "/auth/register" },
      { name: "Seller Dashboard", href: "/seller" },
      { name: "Verification Process", href: "/verification" },
      { name: "Pricing", href: "/pricing" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-slate-900">TradePal</span>
            </div>
            <p className="mb-6 text-sm text-slate-600 max-w-sm">
              Your trusted B2B marketplace connecting businesses worldwide.
              Discover quality suppliers, verified partners, and seamless trade
              solutions.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:support@tradepal.com"
                  className="hover:text-primary-600"
                >
                  support@tradepal.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4" />
                <a href="tel:+1234567890" className="hover:text-primary-600">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>Global Headquarters</span>
              </div>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marketplace links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Marketplace
            </h3>
            <ul className="space-y-3">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              For Sellers
            </h3>
            <ul className="space-y-3">
              {footerLinks.sellers.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-600">
              © {currentYear} TradePal. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
