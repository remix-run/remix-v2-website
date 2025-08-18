import { useMemo, useState } from "react";
import { useLayoutEffect } from "~/ui/primitives/utils";

export type ColorScheme = "dark" | "light" | "system";

const COLOR_SCHEME_KEY = "remix-color-scheme";
const COLOR_SCHEME_EVENT = "colorschemechange";

function getStoredColorScheme(): ColorScheme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(COLOR_SCHEME_KEY);
  if (stored === "dark" || stored === "light" || stored === "system") {
    return stored;
  }
  return "system";
}

function applyColorScheme(colorScheme: ColorScheme) {
  document.documentElement.setAttribute("data-color-scheme", colorScheme);

  const isDark =
    colorScheme === "dark" ||
    (colorScheme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", isDark);
}

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState(() => getStoredColorScheme());

  useLayoutEffect(() => {
    const handleColorSchemeChange = () => {
      setColorScheme(getStoredColorScheme());
    };

    // Listen for changes in the same window
    window.addEventListener(COLOR_SCHEME_EVENT, handleColorSchemeChange);
    // Listen for changes in other tabs/windows
    window.addEventListener("storage", handleColorSchemeChange);

    return () => {
      window.removeEventListener(COLOR_SCHEME_EVENT, handleColorSchemeChange);
      window.removeEventListener("storage", handleColorSchemeChange);
    };
  }, []);

  return colorScheme;
}

export function setColorScheme(colorScheme: ColorScheme) {
  // Update localStorage
  if (colorScheme === "system") {
    localStorage.removeItem(COLOR_SCHEME_KEY);
  } else {
    localStorage.setItem(COLOR_SCHEME_KEY, colorScheme);
  }

  // Apply the scheme immediately
  applyColorScheme(colorScheme);

  // Notify all components in the same window
  window.dispatchEvent(new Event(COLOR_SCHEME_EVENT));

  // Notify other tabs/windows
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: COLOR_SCHEME_KEY,
      newValue: colorScheme === "system" ? null : colorScheme,
      url: window.location.href,
    }),
  );
}

function ColorSchemeScriptImpl() {
  const colorScheme = useColorScheme();

  // Re-apply color scheme on every render to handle client-side navigation
  useLayoutEffect(() => {
    applyColorScheme(colorScheme);
  });

  // Handle system preference changes
  useLayoutEffect(() => {
    if (colorScheme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyColorScheme("system");
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
  }, [colorScheme]);

  // Script to run before React hydration
  const script = useMemo(
    () => `
      (function() {
        const stored = localStorage.getItem('${COLOR_SCHEME_KEY}');
        const colorScheme = stored || 'system';
        const isDark = colorScheme === 'dark' || 
          (colorScheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        document.documentElement.setAttribute('data-color-scheme', colorScheme);
        document.documentElement.classList.toggle('dark', isDark);
      })();
    `,
    [],
  );

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ColorSchemeScript({
  forceConsistentTheme,
}: {
  forceConsistentTheme?: boolean;
}) {
  return forceConsistentTheme ? null : <ColorSchemeScriptImpl />;
}
