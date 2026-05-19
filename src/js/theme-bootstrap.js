/**
 * Bootstrap pages: /theme-init.js (head, early apply) + /js/theme-bootstrap.js (toggle UI).
 * initTheme() skips re-applying root classes when theme-init already ran.
 */
import { initTheme, injectThemeToggle } from "./theme.js";

injectThemeToggle();
initTheme();
