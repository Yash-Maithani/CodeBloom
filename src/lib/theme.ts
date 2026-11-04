// The learner's light or dark choice (DESIGN.md section 7, theme toggle).
// Without a stored choice the site follows the system setting. The one stored
// value is the word "light" or "dark" in localStorage; the Privacy Policy must
// mention it (launch item). Storage can be blocked, so every access is guarded.

export const THEME_KEY = "codebloom-theme";

// Runs in <head> before the first paint, so a stored choice never flashes the
// other theme. Kept tiny and self-contained: it is inlined as a string.
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
