import type { UIConfig } from "./schema";

const esToEnDays: Record<string, string> = {
  lunes: "Monday",
  martes: "Tuesday",
  miércoles: "Wednesday",
  miercoles: "Wednesday",
  jueves: "Thursday",
  viernes: "Friday",
  sábados: "Saturday",
  sabados: "Saturday",
  sábado: "Saturday",
  sabado: "Saturday",
  domingos: "Sunday",
  domingo: "Sunday",
};

const DAY_RANGES: Record<string, string[]> = {
  "lunes a viernes": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "lunes a sábado": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "lunes a domingo": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  sábados: ["Saturday"],
  sábado: ["Saturday"],
  domingos: ["Sunday"],
  domingo: ["Sunday"],
};

export interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

export interface PostalAddress {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressCountry: string;
}

export function parseOpeningHours(businessHours: string): OpeningHoursSpecification[] {
  const parts = businessHours.split("|").map((p) => p.trim());
  return parts
    .map((part) => {
      const match = part.match(/^([^:]+):\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
      if (!match) return null;
      const dayPart = match[1].trim().toLowerCase();
      const opens = match[2].padStart(5, "0");
      const closes = match[3].padStart(5, "0");
      const days = DAY_RANGES[dayPart] || [esToEnDays[dayPart] || dayPart].filter(Boolean);
      return {
        "@type": "OpeningHoursSpecification" as const,
        dayOfWeek: days,
        opens,
        closes,
      };
    })
    .filter((x): x is OpeningHoursSpecification => x !== null);
}

export function buildSiteSchema(
  siteConfig: Pick<UIConfig, "siteName" | "description" | "contact" | "social" | "services">,
  siteUrl: URL,
  ogImageUrl: string,
) {
  const business = {
    "@type": "LocalBusiness" as const,
    name: siteConfig.siteName,
    description: siteConfig.description,
    url: siteUrl.href,
    image: ogImageUrl,
    logo: ogImageUrl,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: parseAddress(siteConfig.contact.address),
    openingHoursSpecification: parseOpeningHours(siteConfig.contact.businessHours),
    sameAs: [siteConfig.social.facebook, siteConfig.social.instagram, siteConfig.social.twitter].filter(Boolean),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      business,
      ...siteConfig.services.map((s) => ({
        "@type": "Service" as const,
        name: s.title,
        description: s.description,
        provider: { "@type": "LocalBusiness" as const, name: siteConfig.siteName },
        image: s.image ? new URL(s.image, siteUrl).href : ogImageUrl,
      })),
    ],
  };
}

export type SiteSchema = ReturnType<typeof buildSiteSchema>;

export function parseAddress(raw: string, defaultLocality = "Ciudad Autónoma de Buenos Aires"): PostalAddress {
  const parts = raw.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    return {
      "@type": "PostalAddress",
      streetAddress: parts.slice(0, -1).join(", "),
      addressLocality: parts[parts.length - 1],
      addressCountry: "AR",
    };
  }
  return {
    "@type": "PostalAddress",
    streetAddress: raw,
    addressLocality: defaultLocality,
    addressCountry: "AR",
  };
}
