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
  if (colorScheme === "system") {
    localStorage.removeItem(COLOR_SCHEME_KEY);
  } else {
    localStorage.setItem(COLOR_SCHEME_KEY, colorScheme);
  }

  // Dispatch custom event to update all components in the same window
  window.dispatchEvent(new Event(COLOR_SCHEME_EVENT));

  // Dispatch storage event to update other tabs/windows
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: COLOR_SCHEME_KEY,
      newValue: colorScheme === "system" ? null : colorScheme,
      url: window.location.href,
    }),
  );

  // Update the data attribute immediately
  document.documentElement.setAttribute("data-color-scheme", colorScheme);

  // Apply the dark class based on the new scheme
  applyColorScheme(colorScheme);
}

function syncColorScheme(media: MediaQueryList | MediaQueryListEvent) {
  if (media.matches) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function applyColorScheme(colorScheme: ColorScheme) {
  switch (colorScheme) {
    case "light":
      document.documentElement.classList.remove("dark");
      break;
    case "dark":
      document.documentElement.classList.add("dark");
      break;
    case "system": {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      syncColorScheme(media);
      break;
    }
  }
}

function ColorSchemeScriptImpl() {
  // This script runs before React hydration to prevent flash of incorrect theme
  let script = useMemo(
    () => `
      (function() {
        const storedScheme = localStorage.getItem('${COLOR_SCHEME_KEY}');
        let colorScheme = storedScheme || 'system';
        
        // Set the data attribute
        document.documentElement.setAttribute('data-color-scheme', colorScheme);
        
        // Apply the appropriate class
        if (colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (colorScheme === 'light') {
          document.documentElement.classList.remove('dark');
        } else if (colorScheme === 'system') {
          const media = window.matchMedia('(prefers-color-scheme: dark)');
          if (media.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      })();
    `,
    [],
  );

  const colorScheme = useColorScheme();

  // Handle runtime changes
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-color-scheme", colorScheme);
    applyColorScheme(colorScheme);

    if (colorScheme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        syncColorScheme(e);
      };
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
  }, [colorScheme]);

  // Also apply color scheme on every render to handle client-side navigation
  // This ensures system preference is re-evaluated when navigating between routes
  useLayoutEffect(() => {
    if (colorScheme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      syncColorScheme(media);
    }
  });

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ColorSchemeScript({
  forceConsistentTheme,
}: {
  forceConsistentTheme?: boolean;
}) {
  return forceConsistentTheme ? null : <ColorSchemeScriptImpl />;
}
