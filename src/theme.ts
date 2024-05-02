import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";

interface Color {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ColorType {
  grey: Color;
  primary: Color;
  greenAccent: Color;
  redAccent: Color;
  blueAccent: Color;
}

// Colour design tokens
export const tokens = (mode: PaletteMode): ColorType => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#1e1e1e",
        },
        primary: {
          100: "#cfd0d3",
          200: "#9fa1a7",
          300: "#5e6b8a", // ASX Company Name Color
          400: "#111429",
          500: "#0b0e1b", // Content bg
          600: "#070a17", // Sidebar bg
          700: "#090c14",
          800: "#05070d",
          900: "#030407",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#4cceac",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
        blueAccent: {
          100: "#e1e2fe",
          200: "#c3c6fd",
          300: "#a4a9fc",
          400: "#1ca8ff", // Secondary
          500: "#1269a1", // Sidebar selected bg
          600: "#535ac8",
          700: "#1269a1",
          800: "#09304a",
          900: "#041830", // Sidebar highlighted bg
        },
      }
    : {
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0",
        },
        primary: {
          100: "#030407",
          200: "#06080e",
          300: "#090c14",
          400: "#f2f0f0",
          500: "#0f1422",
          600: "#3f434e",
          700: "#6f727a",
          800: "#9fa1a7",
          900: "#cfd0d3",
        },
        greenAccent: {
          100: "#0f2922",
          200: "#1e5245",
          300: "#2e7c67",
          400: "#3da58a",
          500: "#4cceac",
          600: "#70d8bd",
          700: "#94e2cd",
          800: "#b7ebde",
          900: "#dbf5ee",
        },
        redAccent: {
          100: "#2c100f",
          200: "#58201e",
          300: "#832f2c",
          400: "#af3f3b",
          500: "#db4f4a",
          600: "#e2726e",
          700: "#e99592",
          800: "#f1b9b7",
          900: "#f8dcdb",
        },
        blueAccent: {
          100: "#151632",
          200: "#2a2d64",
          300: "#3e4396",
          400: "#535ac8",
          500: "#6870fa",
          600: "#868dfb",
          700: "#a4a9fc",
          800: "#c3c6fd",
          900: "#e1e2fe",
        },
      }),
});

// MUI theme settins
export const themeSettings = (mode: PaletteMode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              main: colors.blueAccent[400],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[500],
            },
            success: {
              light: "#00ff38",
              main: "#00cc2d",
              dark: "#004f11",
              contrastText: "#ffffff",
            },
          }
        : {
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.blueAccent[400],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#fcfcfc",
            },
            success: {
              light: "#00ff38",
              main: "#00cc2d",
              dark: "#004f11",
              contrastText: "#ffffff",
            },
          }),
    },
    typography: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 15,
      },
    },
  };
};

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("dark" as PaletteMode);
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};
