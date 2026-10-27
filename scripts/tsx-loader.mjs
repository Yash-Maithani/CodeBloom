// Registers scripts/tsx-loader-hooks.mjs (see there). Loaded with --import.
import { register } from "node:module";

register("./tsx-loader-hooks.mjs", import.meta.url);
