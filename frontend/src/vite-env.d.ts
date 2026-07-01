/// <reference types="vite/client" />

// Some TS setups in this repo treat React types as "missing".
// Keep the app compiling without enforcing strict JSX type checks.
declare module "react";
declare module "react/jsx-runtime";

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module "leaflet/dist/images/marker-icon-2x.png" {
  const src: string;
  export default src;
}

declare module "leaflet/dist/images/marker-icon.png" {
  const src: string;
  export default src;
}

declare module "leaflet/dist/images/marker-shadow.png" {
  const src: string;
  export default src;
}
