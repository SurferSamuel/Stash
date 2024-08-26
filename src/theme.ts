import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { PaletteColorOptions, PaletteMode } from "@mui/material";

// Augment the palette to include new colors
declare module '@mui/material/styles' {
  interface CustomPalette {
    blue: PaletteColorOptions;
  }
  interface Palette extends CustomPalette {}
  interface PaletteOptions extends CustomPalette {}
}

// Extend Button color options to include new color options
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    blue: true;
  }
}

// Extend Switch color options to include new color options
declare module '@mui/material/Switch' {
  interface SwitchPropsColorOverrides {
    blue: true;
  }
}

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
  blueAccent: Color;
}

// Colour design tokens
export const tokens = (mode: PaletteMode): ColorType => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#ffffff", // Primary text
          200: "#bbbbbb", 
          300: "#888888", // Secondary text
          400: "#4a4a4a", 
          500: "#3a3a3a", 
          600: "#2c2c2c", // Sidebar selected bg 
          700: "#212121", // Sidebar hover bg & Card UI 
          800: "#171717", // Content bg
          900: "#121212", // Sidebar bg
        },
        blueAccent: {
          100: "#bbdefb",
          200: "#90caf9",
          300: "#64b5f6",
          400: "#42a5f5", 
          500: "#2196f3", 
          600: "#1e88e5",
          700: "#1976d2",
          800: "#1565c0",
          900: "#0d47a1", 
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

// MUI theme settings
export const themeSettings = (mode: PaletteMode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.grey[100],
            },
            secondary: {
              main: colors.grey[300],
            },
            background: {
              default: colors.grey[800],
            },
            blue: {
              light: colors.blueAccent[400],
              main: colors.blueAccent[600],
              dark: colors.blueAccent[800],
              contrastText: colors.grey[800],
            },
            success: {
              light: "#00ff38",
              main: "#007d1c",
              dark: "#004f11",
              contrastText: "#ffffff",
            },
            error: {
              light: "#e57373",
              main: "#d43a2f",
              dark: "#d32f2f",
              contrastText: "#ffffff"
            }
          }
        : {
            primary: {
              main: colors.grey[100],
            },
            secondary: {
              main: colors.grey[200],
            },
            background: {
              default: "#fcfcfc",
            },
            blue: {
              light: colors.blueAccent[400],
              main: colors.blueAccent[600],
              dark: colors.blueAccent[800],
              contrastText: colors.grey[800],
            },
            success: {
              light: "#00ff38",
              main: "#007d1c",
              dark: "#004f11",
              contrastText: "#ffffff",
            },
            error: {
              light: "#e57373",
              main: "#d43a2f",
              dark: "#d32f2f",
              contrastText: "#ffffff"
            }
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
  toggleColorMode: () => {
    // This is deliberately empty
  },
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
