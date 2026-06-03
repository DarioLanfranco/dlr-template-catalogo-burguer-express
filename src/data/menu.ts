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
  icon: ImageMetadata;
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
//  2. ASSETS — Iconos de categorías (SVG)
// ───────────────────────────────────────

import iconBurguer from "../assets/brand/icons/burguer.svg";
import iconPizza from "../assets/brand/icons/pizza.svg";
import iconEmpanada from "../assets/brand/icons/empanada.svg";
import iconFritas from "../assets/brand/icons/fritas.svg";
import iconBebida from "../assets/brand/icons/bebida.svg";
import iconPromo from "../assets/brand/icons/promo.svg";

// ───────────────────────────────────────
//  3. ASSETS — Imágenes de productos
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
  { id: "burgers", nombre: "Hamburguesas", icon: iconBurguer },
  { id: "pizzas", nombre: "Pizzas", icon: iconPizza },
  { id: "empanadas", nombre: "Empanadas", icon: iconEmpanada },
  { id: "papas", nombre: "Papas", icon: iconFritas },
  { id: "bebidas", nombre: "Bebidas", icon: iconBebida },
  { id: "promos", nombre: "Promos", icon: iconPromo },
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
