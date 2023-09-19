import { Config } from "tailwindcss";
import { shadcnPlugin } from "./shadcn-plugin";
import animatePlugin from "tailwindcss-animate";
import scrollbarPlugin from "tailwind-scrollbar";

const shadcnPreset: Config = {
  darkMode: ["class"],
  // tailwind config object must have a 'content' array
  // this array does not get merged with the default tailwind config file and hence it is safe to leave it empty
  // now technically 'shadcnPreset' is a valid config object (thanks to 'content' array) and therefore a valid preset
  content: [],
  plugins: [animatePlugin, shadcnPlugin, scrollbarPlugin],
};

export { shadcnPreset };
