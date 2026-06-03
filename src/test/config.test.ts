import { describe, it, expect } from "vitest";
import { clientConfigSchema } from "../config/schema";
import { transformConfig } from "../config/mapper";
import type { ClientConfigInput } from "../config/schema";

const validPayload: ClientConfigInput = {
  siteName: "PEPÓN",
  tagline: "El sabor que pega fuerte",
  description: "Catálogo express de comidas. Hamburguesas, pizzas, empanadas, papas y más.",
  theme: {
    primary: "#E63946",
    accent: "#FFC300",
    background: "#FDFBF7",
    text: "#121212",
  },
  contact: {
    phone: "+5493584201263",
    email: "hola@peponexpress.com",
    address: "Av. Corrientes 1234, Buenos Aires",
    googleMapsLink: "https://maps.google.com/?q=Av.+Corrientes+1234+Buenos+Aires",
    businessHours: "Lunes a Viernes: 11:00 - 23:00 | Sábados: 11:00 - 02:00",
    whatsappNumber: "+5493584201263",
  },
  social: {
    instagram: "https://instagram.com/pepon.express",
    facebook: "https://facebook.com/peponexpress",
    twitter: undefined,
  },
  services: [
    {
      title: "Hamburguesas Artesanales",
      description: "Carne premium y pan brioche artesanal.",
      image: "burguerclasica.webp",
    },
  ],
  about: {
    history: {
      title: "Nuestra Historia",
      subtitle: "Pasión por el sabor desde 2024",
      text1: "PEPÓN nació del amor por la comida bien hecha.",
      text2: "Hoy seguimos creciendo con la misma receta.",
      image: "burguertriple.webp",
    },
    mission: {
      title: "Nuestra Misión",
      text: "Transformar la comida express en una experiencia gastronómica de alto nivel.",
      image: "pizzaclasica.webp",
    },
  },
};

describe("clientConfigSchema", () => {
  it("accepts a valid payload", () => {
    const result = clientConfigSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = clientConfigSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects a missing siteName", () => {
    const { siteName, ...rest } = validPayload;
    const result = clientConfigSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid hex color", () => {
    const payload = {
      ...validPayload,
      theme: { ...validPayload.theme, primary: "not-a-color" },
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects a hex color without hash", () => {
    const payload = {
      ...validPayload,
      theme: { ...validPayload.theme, primary: "121212" },
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects a short hex color", () => {
    const payload = {
      ...validPayload,
      theme: { ...validPayload.theme, accent: "#FFF" },
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const payload = {
      ...validPayload,
      contact: { ...validPayload.contact, email: "not-an-email" },
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects a non-https URL", () => {
    const payload = {
      ...validPayload,
      contact: {
        ...validPayload.contact,
        googleMapsLink: "http://maps.google.com",
      },
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects a service with empty title", () => {
    const payload = {
      ...validPayload,
      services: [{ title: "", description: "desc", image: "img.webp" }],
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects a service with empty description", () => {
    const payload = {
      ...validPayload,
      services: [{ title: "Title", description: "", image: "img.webp" }],
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("accepts an empty services array", () => {
    const payload = {
      ...validPayload,
      services: [],
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("accepts a payload without social twitter", () => {
    const payload = {
      ...validPayload,
      social: { instagram: "https://instagram.com/test", facebook: "https://facebook.com/test" },
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects a history with empty title", () => {
    const payload = {
      ...validPayload,
      about: {
        ...validPayload.about,
        history: { title: "", subtitle: "sub", text1: "t1", text2: "t2", image: "img.webp" },
      },
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects a mission with empty text", () => {
    const payload = {
      ...validPayload,
      about: {
        ...validPayload.about,
        mission: { title: "Title", text: "", image: "img.webp" },
      },
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("transformConfig", () => {
  it("returns a complete UIConfig from valid input", () => {
    const result = clientConfigSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const config = transformConfig(result.data);
    expect(config.siteName).toBe("PEPÓN");
    expect(config.tagline).toBe("El sabor que pega fuerte");
    expect(config.theme.primary).toBe("#E63946");
    expect(config.theme.accent).toBe("#FFC300");
    expect(config.contact.email).toBe("hola@peponexpress.com");
    expect(config.contact.googleMapsLink).toBe("https://maps.google.com/?q=Av.+Corrientes+1234+Buenos+Aires");
    expect(config.services).toHaveLength(1);
    expect(config.services[0].id).toBeDefined();
    expect(config.services[0].id).toBe("hamburguesas-artesanales");
    expect(config.about.history.title).toBe("Nuestra Historia");
    expect(config.about.mission.text).toBe("Transformar la comida express en una experiencia gastronómica de alto nivel.");
  });

  it("preserves multiple spaces in tagline", () => {
    const payload = {
      ...validPayload,
      tagline: "Transforma   tu   cuerpo",
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const config = transformConfig(result.data);
    expect(config.tagline).toBe("Transforma   tu   cuerpo");
  });

  it("generates a slug for services without an id", () => {
    const payload = {
      ...validPayload,
      services: [
        { title: "Clases Grupales de Yoga", description: "Yoga para todos.", image: "yoga.webp" },
      ],
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const config = transformConfig(result.data);
    expect(config.services[0].id).toBe("clases-grupales-de-yoga");
  });

  it("preserves a manually provided service id", () => {
    const payload = {
      ...validPayload,
      services: [
        { id: "custom-id", title: "Custom Service", description: "Desc", image: "img.webp" },
      ],
    };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const config = transformConfig(result.data);
    expect(config.services[0].id).toBe("custom-id");
  });

  it("provides a placeholder service when services array is empty", () => {
    const payload = { ...validPayload, services: [] };
    const result = clientConfigSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const config = transformConfig(result.data);
    expect(config.services).toHaveLength(1);
    expect(config.services[0].title).toBe("Próximamente");
    expect(config.services[0].id).toBe("service-placeholder");
  });

  it("preserves a valid https googleMapsLink", () => {
    const result = clientConfigSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const config = transformConfig(result.data);
    expect(config.contact.googleMapsLink).toBe("https://maps.google.com/?q=Av.+Corrientes+1234+Buenos+Aires");
  });

  it("preserves social links when provided", () => {
    const result = clientConfigSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const config = transformConfig(result.data);
    expect(config.social.instagram).toBe("https://instagram.com/pepon.express");
    expect(config.social.facebook).toBe("https://facebook.com/peponexpress");
    expect(config.social.twitter).toBeUndefined();
  });


});
