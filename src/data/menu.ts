/*
 * ───────────────────────────────────────────────────────
 *  PEPÓN — Catálogo de menú (datos estáticos)
 *  Tipos, categorías y productos del catálogo express.
 * ───────────────────────────────────────────────────────
 */

// ───────────────────────────────────────
//  1. TIPOS
// ───────────────────────────────────────

export type CategoriaId =
  | "burgers"
  | "pizzas"
  | "empanadas"
  | "papas"
  | "bebidas"
  | "promos";

export type ProductoTag = "BEST SELLER" | "NUEVA" | "CLÁSICA";

interface ImageMetadata {
  src: string;
  width: number;
  height: number;
  format: "avif" | "png" | "webp" | "jpeg" | "jpg" | "svg" | "tiff" | "gif";
  orientation?: number;
}

export interface Categoria {
  id: CategoriaId;
  nombre: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaId;
  imagen: ImageMetadata;
  disponible: boolean;
  tag?: ProductoTag;
}

// ───────────────────────────────────────
//  2. ASSETS — Imágenes de productos
// ───────────────────────────────────────

import imgHeadBurguer from "../assets/images/headburguer.webp";
import imgBurgerClasica from "../assets/images/burguerclasica.webp";
import imgBurgerDoble from "../assets/images/burguerdoble.webp";
import imgBurgerTriple from "../assets/images/burguertriple.webp";
import imgPizzaClasica from "../assets/images/pizzaclasica.webp";

// ───────────────────────────────────────
//  4. CATEGORÍAS
// ───────────────────────────────────────

export const CATEGORIAS: Categoria[] = [
  { id: "burgers", nombre: "Hamburguesas" },
  { id: "pizzas", nombre: "Pizzas" },
  { id: "empanadas", nombre: "Empanadas" },
  { id: "papas", nombre: "Papas" },
  { id: "bebidas", nombre: "Bebidas" },
  { id: "promos", nombre: "Promos" },
];

// ───────────────────────────────────────
//  5. DATASET DEL MENÚ
// ───────────────────────────────────────

export const MENU_DATA: Producto[] = [
  {
    id: "burger-clasica",
    nombre: "Burger Clásica",
    descripcion: "Carne, queso cheddar, lechuga, tomate, cebolla y salsa pepon.",
    precio: 7200,
    categoria: "burgers",
    imagen: imgBurgerClasica,
    disponible: true,
    tag: "BEST SELLER",
  },
  {
    id: "burger-doble",
    nombre: "Burger Doble",
    descripcion: "Doble carne, doble queso cheddar, bacon, cebolla crispy y salsa pepon.",
    precio: 9800,
    categoria: "burgers",
    imagen: imgBurgerDoble,
    disponible: true,
    tag: "BEST SELLER",
  },
  {
    id: "burger-triple",
    nombre: "Burger Triple",
    descripcion: "Triple carne, triple queso cheddar, bacon, cebolla crispy y salsa pepon.",
    precio: 12900,
    categoria: "burgers",
    imagen: imgBurgerTriple,
    disponible: true,
    tag: "NUEVA",
  },
  {
    id: "pizza-especial",
    nombre: "Pizza Especial",
    descripcion: "Muzzarella, jamón, morrón, aceitunas y orégano.",
    precio: 8500,
    categoria: "pizzas",
    imagen: imgPizzaClasica,
    disponible: true,
    tag: "CLÁSICA",
  },
  {
    id: "combo-pepon",
    nombre: "Combo Pepon",
    descripcion: "Burger Doble + Papas + Gaseosa 350ml.",
    precio: 12500,
    categoria: "promos",
    imagen: imgHeadBurguer,
    disponible: true,
  },
];
