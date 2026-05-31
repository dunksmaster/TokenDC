/** Central SEO metadata for DuaCrypto public HTML pages. */
export const siteUrl = "https://duacrypto.com";
export const siteName = "DuaCrypto";
export const defaultOgImage = `${siteUrl}/img/og-default.png`;

export const organization = {
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "DuaCrypto",
  url: siteUrl,
  description:
    "Albania's first Bitcoin and crypto community in Tirana. Web3 education, Balkans events, corporate Bitcoin (DAL), and 10,000+ members.",
  foundingDate: "2020",
  areaServed: ["Albania", "Balkans"],
  knowsAbout: [
    "Bitcoin",
    "Cryptocurrency",
    "Web3",
    "Blockchain education",
    "Corporate Bitcoin treasury",
  ],
  logo: `${siteUrl}/img/duacrypto-mark.svg`,
  email: "info@duacrypto.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tirana",
    addressCountry: "AL",
  },
  sameAs: [
    "https://t.me/dua_crypto",
    "https://x.com/duacrypto",
    "https://youtube.com/@duacrypto",
    "https://facebook.com/duacrypto",
    "https://linkedin.com/company/duacrypto",
  ],
};

/** Indexable pages with SEO config. */
export const seoPages = [
  {
    file: "index.html",
    path: "/",
    title: "Bitcoin & Crypto Community in Albania | DuaCrypto Tirana",
    description:
      "DuaCrypto — Albania's first Bitcoin and crypto community in Tirana. Web3 education, Balkans events, corporate Bitcoin (DAL), and 10,000+ members.",
    ogType: "website",
    includeOrganization: true,
    includeWebSite: true,
    breadcrumb: null,
  },
  {
    file: "about.html",
    path: "/about.html",
    title: "About Us | DuaCrypto",
    description:
      "Learn about DuaCrypto, Albania's first crypto community, founder Dkane, and our mission for Web3 education in the Balkans.",
    ogType: "website",
    includeOrganization: true,
    breadcrumb: [{ name: "About Us", path: "/about.html" }],
  },
  {
    file: "service.html",
    path: "/service.html",
    title: "Crypto Education & Community Services | DuaCrypto",
    description:
      "DuaCrypto services: Bitcoin education, Tirana meetups, Web3 workshops, and community support across Albania and the Balkans.",
    ogType: "website",
    includeOrganization: true,
    breadcrumb: [{ name: "Services", path: "/service.html" }],
  },
  {
    file: "roadmap.html",
    path: "/roadmap.html",
    title: "Community Roadmap | DuaCrypto",
    description:
      "DuaCrypto roadmap — from Tirana meetups to Balkans-wide Web3 education, events, and Bitcoin adoption milestones.",
    ogType: "website",
    includeOrganization: true,
    breadcrumb: [{ name: "Roadmap", path: "/roadmap.html" }],
  },
  {
    file: "events.html",
    path: "/events.html",
    title: "Bitcoin & Web3 Events in Tirana | DuaCrypto",
    description:
      "Join DuaCrypto in Tirana — Balkans Crypto 2026 updates, plus Bitcoin Pizza Day 2025 and Balkans Crypto 2025 highlights across the Balkans.",
    ogType: "website",
    ogImage: `${siteUrl}/img/balkans-crypto-2026-2.png`,
    includeOrganization: true,
    breadcrumb: [{ name: "Events", path: "/events.html" }],
    events: [
      {
        name: "Balkans Crypto 2026 Tech Conference",
        description:
          "Upcoming regional DeFi and Web3 conference in Tirana with DuaCrypto community meetups and partner showcases.",
        startDate: "2026-06-15",
        location: "Tirana, Albania",
        image: `${siteUrl}/img/balkans-crypto-2026-2.png`,
        url: `${siteUrl}/events.html#balkans-crypto-2026`,
        eventStatus: "https://schema.org/EventScheduled",
      },
      {
        name: "Bitcoin Pizza Day 2025 — DuaCrypto Tirana Meetup",
        description:
          "Community celebration of Bitcoin Pizza Day with meetups, pizza, and live photos from The Taproom in Tirana.",
        startDate: "2025-05-22",
        location: "The Taproom, Tirana, Albania",
        image: `${siteUrl}/img/bitcoin-pizza-day-3.png`,
        url: `${siteUrl}/events.html#bitcoin-pizza-day`,
        eventStatus: "https://schema.org/EventCompleted",
      },
      {
        name: "Balkans Crypto 2025 Tech Conference",
        description:
          "Regional DeFi and Web3 conference with networking, expo booths, and DuaCrypto community presence.",
        startDate: "2025-06-15",
        endDate: "2025-06-16",
        location: "Tirana, Albania",
        image: `${siteUrl}/img/balkans-crypto-2025-3.png`,
        url: `${siteUrl}/events.html#balkans-crypto-2025`,
        eventStatus: "https://schema.org/EventCompleted",
      },
    ],
  },
  {
    file: "feature.html",
    path: "/feature.html",
    title: "Why Join DuaCrypto | DuaCrypto",
    description:
      "Why DuaCrypto is Albania's trusted crypto community — local mentors, Bitcoin education, secure learning, and Balkans-first support.",
    ogType: "website",
    includeOrganization: true,
    breadcrumb: [{ name: "Features", path: "/feature.html" }],
  },
  {
    file: "bitcoin-for-corporations.html",
    path: "/bitcoin-for-corporations.html",
    title: "Bitcoin for Corporations | DAL — DuaCrypto",
    description:
      "Digital Asset Leaders Association — enterprise Bitcoin adoption, treasury strategy, and executive networking for CTOs, directors, and corporate treasuries.",
    ogType: "website",
    includeOrganization: true,
    ogImage: `${siteUrl}/img/dal-logo.svg`,
    breadcrumb: [{ name: "Bitcoin for Corporations", path: "/bitcoin-for-corporations.html" }],
  },
  {
    file: "faq.html",
    path: "/faq.html",
    title: "FAQs | DuaCrypto",
    description:
      "Frequently asked questions about DuaCrypto, Bitcoin, Web3 education, and joining Albania's crypto community.",
    ogType: "website",
    includeOrganization: true,
    breadcrumb: [{ name: "FAQs", path: "/faq.html" }],
    faqs: [
      {
        question:
          "What is DuaCrypto and how do I join the Albania crypto community?",
        answer:
          "DuaCrypto is Albania's first crypto community, founded in Tirana in 2020. Join free via our Telegram group, attend Bitcoin meetups, or explore guides at duacrypto.org — no prior experience required.",
      },
      {
        question: "Does DuaCrypto offer Bitcoin and Web3 education in Albanian?",
        answer:
          "Yes. We provide beginner-friendly workshops, mentor-led sessions, and free guides in Albanian and English covering Bitcoin basics, wallet security, P2P trading, and Web3 concepts tailored for the Balkans.",
      },
      {
        question:
          "How does DuaCrypto help businesses with crypto regulations in Albania?",
        answer:
          "We offer corporate consulting on Albania's DLT financial markets law, AMF compliance, AML/KYC obligations, and tax structuring for enterprises exploring Bitcoin or blockchain operations in Albania.",
      },
      {
        question: "Are DuaCrypto events in Tirana open to beginners?",
        answer:
          "Absolutely. Our Tirana meetups — including Bitcoin Pizza Day and Balkans Crypto events — welcome beginners, students, developers, and professionals. Check events.html for upcoming dates.",
      },
      {
        question: "How can I contact DuaCrypto for partnerships or media?",
        answer:
          "Email info@duacrypto.com or message us on Telegram at t.me/dua_crypto. We welcome collaborations, donations, and media inquiries.",
      },
      {
        question: "Is DuaCrypto financial advice or an exchange?",
        answer:
          "DuaCrypto is an educational community, not a licensed exchange or investment advisor. We teach Bitcoin and Web3 skills; always do your own research before investing.",
      },
      {
        question: "What is the best crypto community in Albania?",
        answer:
          "DuaCrypto is Albania's leading Bitcoin and crypto community, founded in Tirana in 2020 with 10,000+ members. Join via Telegram, attend monthly meetups, and access Albanian and English education on Bitcoin, Web3, and wallet security.",
      },
      {
        question: "Where are Bitcoin meetups in Tirana?",
        answer:
          "DuaCrypto hosts monthly Bitcoin meetups in Tirana, including Bitcoin Pizza Day celebrations and Balkans Crypto conference side events. See events.html for upcoming dates, photos, and registration details.",
      },
      {
        question: "What is DAL / Bitcoin for Corporations at DuaCrypto?",
        answer:
          "DAL (Digital Asset Leaders Association) is DuaCrypto's enterprise program for corporate Bitcoin adoption, treasury strategy, and executive networking. Learn more at bitcoin-for-corporations.html.",
      },
    ],
  },
  {
    file: "contact.html",
    path: "/contact.html",
    title: "Contact | DuaCrypto",
    description:
      "Contact DuaCrypto in Tirana for partnerships, Bitcoin education, donations, and Balkans crypto community support.",
    ogType: "website",
    includeOrganization: true,
    breadcrumb: [{ name: "Contact", path: "/contact.html" }],
  },
  {
    file: "donation.html",
    path: "/donation.html",
    title: "Donate a Book | DuaCrypto",
    description:
      "Donate a Bitcoin book to Balkans students via Lightning Network. 100% of sats fund books through DuaCrypto and Konsensus Network (bitcoinbook.shop).",
    ogType: "website",
    includeOrganization: true,
    breadcrumb: [{ name: "Donate a Book", path: "/donation.html" }],
  },
  {
    file: "privacy.html",
    path: "/privacy.html",
    title: "Privacy Policy | DuaCrypto",
    description:
      "DuaCrypto privacy policy — how we collect, use, and protect your data when you join our Albania crypto community.",
    ogType: "website",
    includeOrganization: true,
    breadcrumb: [{ name: "Privacy Policy", path: "/privacy.html" }],
  },
  {
    file: "terms.html",
    path: "/terms.html",
    title: "Terms of Service | DuaCrypto",
    description:
      "DuaCrypto terms of service for community members, event attendees, and visitors to our Bitcoin and Web3 education platform.",
    ogType: "website",
    includeOrganization: true,
    breadcrumb: [{ name: "Terms of Service", path: "/terms.html" }],
  },
];

export function pageUrl(path) {
  return path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`;
}

export function breadcrumbJsonLd(page) {
  if (!page.breadcrumb?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: pageUrl("/"),
      },
      ...page.breadcrumb.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: crumb.name,
        item: pageUrl(crumb.path),
      })),
    ],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    ...organization,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: organization.description ?? seoPages[0].description,
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/faq.html?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqPageJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

export function eventsJsonLd(events) {
  return events.map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus:
      event.eventStatus ?? "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Tirana",
        addressCountry: "AL",
      },
    },
    image: event.image,
    url: event.url,
    organizer: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
  }));
}

export function jsonLdScripts(page) {
  const graphs = [];
  if (page.includeOrganization) {
    graphs.push(organizationJsonLd());
  }
  if (page.includeWebSite) {
    graphs.push(websiteJsonLd());
  }
  const breadcrumb = breadcrumbJsonLd(page);
  if (breadcrumb) graphs.push(breadcrumb);
  if (page.faqs?.length) {
    graphs.push(faqPageJsonLd(page.faqs));
  }
  if (page.events?.length) {
    graphs.push(...eventsJsonLd(page.events));
  }
  return graphs.map(
    (data) =>
      `<script type="application/ld+json">${JSON.stringify(data)}</script>`
  );
}

export function buildSeoHeadBlock(page) {
  const url = pageUrl(page.path);
  const ogImage = page.ogImage ?? defaultOgImage;
  const lines = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="${page.ogType ?? "website"}">`,
    `<meta property="og:site_name" content="${siteName}">`,
    `<meta property="og:title" content="${page.title}">`,
    `<meta property="og:description" content="${page.description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${page.title}">`,
    `<meta name="twitter:description" content="${page.description}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    ...jsonLdScripts(page),
  ];
  return lines.map((line) => `    ${line}`).join("\n");
}
