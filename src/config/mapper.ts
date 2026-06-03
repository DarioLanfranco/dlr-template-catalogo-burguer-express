import type { ClientConfigInput, UIConfig } from "./schema";
import { generateSlug, normalizeBusinessHours, sanitizeUrl } from "./transforms";

export function transformConfig(raw: ClientConfigInput): UIConfig {
  return {
    ...raw,
    contact: {
      ...raw.contact,
      googleMapsLink: sanitizeUrl(raw.contact.googleMapsLink),
      businessHours: normalizeBusinessHours(raw.contact.businessHours),
    },
    social: {
      ...raw.social,
      ...(raw.social.instagram && { instagram: sanitizeUrl(raw.social.instagram) }),
      ...(raw.social.facebook && { facebook: sanitizeUrl(raw.social.facebook) }),
      ...(raw.social.twitter && { twitter: sanitizeUrl(raw.social.twitter) }),
    },
    services:
      raw.services.length > 0
        ? raw.services.map((s) => ({ ...s, id: s.id ?? generateSlug(s.title) }))
        : [
            {
              id: "service-placeholder",
              title: "Próximamente",
              description:
                "Nuestros servicios estarán disponibles pronto. Contáctanos para más información.",
              image: "headburguer.webp",
            },
          ],
  };
}
