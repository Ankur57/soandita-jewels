import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/soandita-logo.png";

/* Accordion section – visible only on mobile */
function AccordionSection({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 md:border-none">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-4 md:hidden text-white font-semibold text-sm tracking-wider uppercase"
      >
        {title}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Desktop heading */}
      <h3 className="hidden md:block text-white font-semibold text-lg mb-4">
        {title}
      </h3>

      {/* Links – always visible on md+, toggled on mobile */}
      <ul
        className={`flex flex-col gap-2.5 overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-4" : "max-h-0 md:max-h-none"
          }`}
      >
        {children}
      </ul>
    </div>
  );
}

function Footer() {
const message =
  "Hello Soandita Jewels! \u{1F44B}\u{2728}\n" +
  "I\u2019m interested in your beautiful jewellery collection \u{1F48E}\n" +
  "Could you please help me with product details, pricing, and availability?\n" +
  "Thank you! \u{1F60A}";
const whatsappURL =
  `https://api.whatsapp.com/send/?phone=918175885025&text=${encodeURIComponent(message)}`;
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
        {/* Desktop: 4-col grid  |  Mobile: stacked accordions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-10">
          {/* Logo & Description — shown at bottom on mobile, top-left on desktop */}
          <div className="hidden md:flex flex-col gap-4 order-1">
            <img
              src={logo}
              alt="Soandita Jewels"
              className="w-44 object-contain brightness-0 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover timeless elegance and exceptional craftsmanship. Shop now
              and let your style shine with Soandita Jewels.
            </p>
          </div>

          {/* Menu */}
          <div className="order-2">
            <AccordionSection title="Categories">
              <li>
                <Link
                  to="/shop?category=new"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  New in
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=ring"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Ring
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=necklace"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Necklace
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=earrings"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Earrings
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=gift"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Gift
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  About
                </Link>
              </li>
            </AccordionSection>
          </div>

          {/* About */}
          <div className="order-3">
            <AccordionSection title="Information">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href={whatsappURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1.5"
                >
                  WhatsApp Us
                </a>
              </li>
            </AccordionSection>
          </div>

          {/* Social */}
          <div className="order-4">
            <AccordionSection title="Social">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/soandita/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  X
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  LinkedIn
                </a>
              </li>
            </AccordionSection>
          </div>

          {/* Logo on mobile — shown below the accordions */}
          <div className="flex md:hidden flex-col items-start gap-3 pt-6 order-5">
            <img
              src={logo}
              alt="Soandita Jewels"
              className="w-36 object-contain brightness-0 invert"
            />
            <p className="text-gray-400 text-xs leading-relaxed">
              Discover timeless elegance and exceptional craftsmanship.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">
            © 2026 Soandita Jewels. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Developed by Ankur Bajpai | ankurbajpai100@gmail.com
          </p>
          <div className="flex gap-6">
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors text-xs"
            >
              Privacy Policy
            </Link>
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors text-xs"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors text-xs"
            >
              Return &amp; Exchange
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;