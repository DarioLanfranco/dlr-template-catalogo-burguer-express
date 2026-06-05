import { describe, it, expect } from "vitest";
import { parseOpeningHours, parseAddress, safeJsonLd } from "../config/helpers";

describe("parseOpeningHours", () => {
  it("parses a standard weekday + weekend range", () => {
    const result = parseOpeningHours(
      "Lunes a Viernes: 6:00 - 22:00 | Sábados: 8:00 - 18:00",
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "06:00",
      closes: "22:00",
    });
    expect(result[1]).toEqual({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "08:00",
      closes: "18:00",
    });
  });

  it("parses a single-day range", () => {
    const result = parseOpeningHours("Domingos: 10:00 - 14:00");
    expect(result).toHaveLength(1);
    expect(result[0].dayOfWeek).toEqual(["Sunday"]);
    expect(result[0].opens).toBe("10:00");
    expect(result[0].closes).toBe("14:00");
  });

  it("parses accented and unaccented spanish day names", () => {
    const accented = parseOpeningHours("Miércoles: 9:00 - 13:00");
    const unaccented = parseOpeningHours("Miercoles: 9:00 - 13:00");
    expect(accented[0].dayOfWeek).toEqual(["Wednesday"]);
    expect(unaccented[0].dayOfWeek).toEqual(["Wednesday"]);
  });

  it("pads single-digit hours with leading zero", () => {
    const result = parseOpeningHours("Lunes: 8:00 - 17:00");
    expect(result[0].opens).toBe("08:00");
    expect(result[0].closes).toBe("17:00");
  });

  it("trims surrounding whitespace from input", () => {
    const result = parseOpeningHours("  Sábados: 9:00 - 18:00  ");
    expect(result).toHaveLength(1);
    expect(result[0].dayOfWeek).toEqual(["Saturday"]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseOpeningHours("")).toEqual([]);
  });

  it("returns an empty array for a malformed string", () => {
    expect(parseOpeningHours("not a valid format")).toEqual([]);
  });

  it("skips a malformed segment but keeps valid ones", () => {
    const result = parseOpeningHours(
      "Lunes: 9:00 - 17:00 | gibberish | Martes: 10:00 - 18:00",
    );
    expect(result).toHaveLength(2);
    expect(result[0].dayOfWeek).toEqual(["Monday"]);
    expect(result[1].dayOfWeek).toEqual(["Tuesday"]);
  });

  it("preserves an unrecognized day name as raw string", () => {
    const result = parseOpeningHours("Funday: 9:00 - 17:00");
    expect(result).toHaveLength(1);
    expect(result[0].dayOfWeek).toEqual(["funday"]);
  });

  it("handles range spanning lunes a sábado", () => {
    const result = parseOpeningHours("Lunes a Sábado: 7:00 - 21:00");
    expect(result[0].dayOfWeek).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]);
  });

  it("handles range spanning lunes a domingo", () => {
    const result = parseOpeningHours("Lunes a Domingo: 0:00 - 23:59");
    expect(result[0].dayOfWeek).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
  });
});

describe("parseAddress", () => {
  it("parses street and city from a standard comma-separated address", () => {
    const result = parseAddress("Av. Corrientes 1234, Buenos Aires");
    expect(result).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Av. Corrientes 1234",
      addressLocality: "Buenos Aires",
      addressCountry: "AR",
    });
  });

  it("handles address with multiple commas", () => {
    const result = parseAddress("Calle 1, Local 2, Ciudad");
    expect(result.streetAddress).toBe("Calle 1, Local 2");
    expect(result.addressLocality).toBe("Ciudad");
  });

  it("falls back when no comma is present", () => {
    const result = parseAddress("Una direccion sin coma");
    expect(result.streetAddress).toBe("Una direccion sin coma");
    expect(result.addressLocality).toBe("Ciudad Autónoma de Buenos Aires");
    expect(result.addressCountry).toBe("AR");
  });

  it("handles empty string gracefully", () => {
    const result = parseAddress("");
    expect(result.streetAddress).toBe("");
    expect(result.addressLocality).toBe("Ciudad Autónoma de Buenos Aires");
    expect(result.addressCountry).toBe("AR");
  });

  it("trims whitespace around parts", () => {
    const result = parseAddress("  Calle Falsa 123 ,  Spring字段  ");
    expect(result.streetAddress).toBe("Calle Falsa 123");
    expect(result.addressLocality).toBe("Spring字段");
  });

  it("handles only commas without content", () => {
    const result = parseAddress(",,");
    expect(result.streetAddress).toBe(", ");
    expect(result.addressLocality).toBe("");
  });

  it("returns the correct schema type", () => {
    const result = parseAddress("Calle 1, Ciudad");
    expect(result["@type"]).toBe("PostalAddress");
  });
});

describe("safeJsonLd", () => {
  it("returns valid JSON for a plain object", () => {
    const result = safeJsonLd({ name: "Pepón", price: 7200 });
    expect(result).toBe('{"name":"Pepón","price":7200}');
  });

  it("escapes </script> sequences to prevent XSS", () => {
    const malicious = { html: "</script><img src=x onerror=alert(1)>" };
    const result = safeJsonLd(malicious);
    expect(result).not.toContain("</script>");
    expect(result).toContain("<\\/script>");
  });

  it("handles null input gracefully", () => {
    const result = safeJsonLd(null);
    expect(result).toBe("null");
  });

  it("handles undefined input gracefully", () => {
    const result = safeJsonLd(undefined);
    expect(result).toBe("");
  });
});
