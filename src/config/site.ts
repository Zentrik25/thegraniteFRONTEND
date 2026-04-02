export const siteConfig = {
  name: "The Granite Post",
  tagline: "Zimbabwe's Authoritative Voice",
  description:
    "Authoritative news and analysis from Zimbabwe. Breaking news, politics, business, technology and sport.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/og-default.jpg",
  twitterHandle: "@GranitePost",
  locale: "en_ZW",

  // Navigation
  primaryNavItems: [
    { label: "News", href: "/" },
    { label: "Politics", href: "/categories/politics" },
    { label: "Business", href: "/categories/business" },
    { label: "Technology", href: "/categories/technology" },
    { label: "Sport", href: "/categories/sport" },
  ],

  // Footer
  footerLinks: {
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Advertise", href: "/advertise" },
      { label: "Careers", href: "/careers" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Editorial Standards", href: "/editorial-standards" },
    ],
    account: [
      { label: "Subscribe", href: "/subscribe" },
      { label: "Sign In", href: "/login" },
      { label: "My Account", href: "/account" },
      { label: "Newsletter", href: "/#newsletter" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
