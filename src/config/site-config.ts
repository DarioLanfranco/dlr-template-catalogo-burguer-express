import { clientConfigSchema, type ClientConfigInput } from "./schema";
import { transformConfig } from "./mapper";
import type { UIConfig } from "./schema";

const rawPeponConfig = {
  siteName: "PEPÓN",
  tagline: "El sabor que pega fuerte",
  description:
    "Descubrí PEPÓN, el catálogo express de comidas que combina ingredientes frescos con un estilo brutal. Hamburguesas, pizzas, empanadas, papas y más para disfrutar en casa o llevar.",
  theme: {
    primary: "#E63946",
    accent: "#FFC300",
    background: "#FDFBF7",
    text: "#121212",
  },
  contact: {
    phone: "+5493584201263",
    email: "dariolanfrancoruffener@gmail.com",
    address: "Av. Corrientes 1234, Buenos Aires",
    googleMapsLink:
      "https://maps.google.com/?q=Av.+Corrientes+1234+Buenos+Aires",
    businessHours:
      "Lunes a Viernes: 11:00 - 23:00 | Sábados: 11:00 - 02:00 | Domingos: 18:00 - 23:00",
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
      description:
        "Carne premium, pan brioche artesanal y nuestras salsas signature. La estrella del menú.",
      image: "burguerclasica.webp",
    },
    {
      title: "Pizzas al Molde",
      description:
        "Masa madre fermentada 24hs, muzzarella fresca y los mejores toppings.",
      image: "pizzaclasica.webp",
    },
    {
      title: "Combos Promo",
      description:
        "Las mejores combinaciones para compartir o darse un capricho. Relación precio-calidad imbatible.",
      image: "burguerdoble.webp",
    },
  ],
  about: {
    history: {
      title: "Nuestra Historia",
      subtitle: "Pasión por el sabor desde 2024",
      text1:
        "PEPÓN nació del amor por la comida bien hecha y el deseo de crear una experiencia gastronómica única, donde cada bocado sea una explosión de sabor. Arrancamos como un pequeño delivery de barrio con una idea clara: comida brutal sin vueltas.",
      text2:
        "Hoy seguimos creciendo con la misma receta: ingredientes frescos de primera calidad, recetas propias que rompen el molde y un equipo que pone el alma en cada pedido. Nuestra filosofía es simple: si no es PEPÓN, no es lo mismo.",
      image: "peponlugar.webp",
    },
    mission: {
      title: "Nuestra Misión",
      text: "Transformar la comida express en una experiencia gastronómica de alto nivel, ofreciendo platos elaborados con ingredientes frescos, recetas originales y un servicio rápido que no sacrifica calidad. Cada pedido es una oportunidad para romper la rutina.",
      image: "peponlugar.webp",
    },
  },
} satisfies ClientConfigInput;

const validationResult = clientConfigSchema.safeParse(rawPeponConfig);

if (!validationResult.success) {
  console.error("FATAL: Site configuration validation failed:");
  console.error(validationResult.error.issues);
  throw new Error(
    "Site configuration validation failed. The build cannot proceed with invalid configuration data.",
  );
}

const processedConfig: UIConfig = transformConfig(validationResult.data);

export const siteConfig: UIConfig = processedConfig;

export type { UIConfig } from "./schema";
