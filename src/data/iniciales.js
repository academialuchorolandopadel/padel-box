/* Datos que se cargan UNA sola vez, la primera vez que entra el dueño.
   Se escriben desde la app con el botón de "Configuración inicial"
   (ver src/services/setup.js). Editá estos valores si cambian los precios. */

export const CONFIG_INICIAL = {
  valorHora: { box1: 80000, box2: 100000, box3: 100000 },
  tuboPrecio: 80000,
};

export const PRODUCTOS_INICIALES = [
  { nombre: "Agua de litro",    precio: 10000, categoria: "Bebida",   stockActual: 24,  stockMinimo: 12 },
  { nombre: "Agua chica",       precio: 7000,  categoria: "Bebida",   stockActual: 40,  stockMinimo: 12 },
  { nombre: "Coca 500",         precio: 10000, categoria: "Bebida",   stockActual: 24,  stockMinimo: 12 },
  { nombre: "Powerade",         precio: 14000, categoria: "Bebida",   stockActual: 18,  stockMinimo: 10 },
  { nombre: "Tónica rosa",      precio: 10000, categoria: "Bebida",   stockActual: 15,  stockMinimo: 6 },
  { nombre: "Munich promo",     precio: 45000, categoria: "Cerveza",  stockActual: 30,  stockMinimo: 12 },
  { nombre: "Fernet promo",     precio: 50000, categoria: "Cerveza",  stockActual: 12,  stockMinimo: 8 },
  { nombre: "Cheese burguer",   precio: 25000, categoria: "Comida",   stockActual: 20,  stockMinimo: 6 },
  { nombre: "Cheese doble",     precio: 40000, categoria: "Comida",   stockActual: 14,  stockMinimo: 6 },
  { nombre: "Lomito árabe",     precio: 30000, categoria: "Comida",   stockActual: 10,  stockMinimo: 6 },
  { nombre: "Papas fritas",     precio: 20000, categoria: "Comida",   stockActual: 22,  stockMinimo: 8 },
  { nombre: "Alquiler de pala", precio: 20000, categoria: "Servicio", stockActual: 999, stockMinimo: 0 },
  { nombre: "Over grip",        precio: 25000, categoria: "Servicio", stockActual: 35,  stockMinimo: 10 },
];
