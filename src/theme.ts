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
  blueAccent: Color;
}

// Colour design tokens
export const tokens = (mode: PaletteMode): ColorType => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#ffffff", // Primary text
          200: "#bbbbbb", 
          300: "#aaaab2", // Secondary text
          400: "#7a7a7f",
          500: "#3a3a3f", // Scrollbar hover, Borders & Input Outline
          600: "#27272a", // Sidebar selected bg, Scrollbar handle, Dialog Outline
          700: "#212124", // Sidebar hover bg & card UI 
          800: "#121212",
          900: "#0a0a0b", // Sidebar & content bg
        },
        blueAccent: {
          100: "#bbdefb",
          200: "#90caf9",
          300: "#64b5f6",
          400: "#42a5f5", 
          500: "#2196f3", 
          600: "#1e88e5", // Graph components
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
              default: colors.grey[900],
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
      fontFamily: "Geist Variable, Arial, sans-serif",
      fontSize: 12,
      h1: {
        fontFamily: "Geist Variable, Arial, sans-serif",
        fontSize: 40,
      },
      h2: {
        fontFamily: "Geist Variable, Arial, sans-serif",
        fontSize: 32,
      },
      h3: {
        fontFamily: "Geist Variable, Arial, sans-serif",
        fontSize: 24,
      },
      h4: {
        fontFamily: "Geist Variable, Arial, sans-serif",
        fontSize: 20,
      },
      h5: {
        fontFamily: "Geist Variable, Arial, sans-serif",
        fontSize: 16,
      },
      h6: {
        fontFamily: "Geist Variable, Arial, sans-serif",
        fontSize: 15,
      },
    },
    components: {
      MuiAccordion: {
        defaultProps: {
          disableGutters: true,
        },
        styleOverrides: {
          root: {
            gridColumn: "span 4",
            backgroundColor: colors.grey[900],
            boxShadow: "none",
            "&:before": {
              display: "none",
            },
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            backgroundColor: colors.grey[900],
            padding: 0,
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            backgroundColor: colors.grey[900],
            "& .MuiAccordionSummary-content": {
              marginLeft: "10px",
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            fontSize: 14,
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.grey[900],
            backgroundImage: "none",
            boxShadow: "none",
            marginTop: "4px",
            border: `1px solid ${colors.grey[600]}`,
          },
          listbox: {
            padding: "0px",
          }
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none" as const,
            fontSize: 14,
          },
          contained: {
            fontWeight: 550,
          },
          outlined: {
            borderColor: colors.grey[500],
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
              backgroundColor: "inherit",
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              backgroundColor: colors.grey[600],
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
              backgroundColor: colors.grey[500],
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "8px",
            border: `1px solid ${colors.grey[600]}`,
            boxShadow: "none",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: colors.grey[900],
            paddingTop: "20px",
            marginBottom: "-6px",
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            backgroundColor: colors.grey[900],
            marginBottom: "-6px",
          },
        },
      },
      MuiDialogContentText: {
        styleOverrides: {
          root: {
            color: colors.grey[300],
            fontSize: 15,
            fontWeight: 400,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            backgroundColor: colors.grey[900],
            paddingRight: "25px",
            paddingBottom: "25px",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.grey[500],
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: 12,
            fontWeight: 600,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.grey[500],
            },
          },
        },
      },
      MuiSwitch: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            width: 42,
            height: 24,
            padding: 0,
            '& .MuiSwitch-switchBase': {
              padding: 0,
              margin: 2,
              transitionDuration: '160ms',
              '&.Mui-checked': {
                transform: 'translateX(18px)',
                '& + .MuiSwitch-track': {
                  backgroundColor: colors.grey[100],
                  opacity: 1,
                  border: 0,
                },
                '&.Mui-disabled + .MuiSwitch-track': {
                  opacity: 0.5,
                },
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.7,
              },
            },
            '& .MuiSwitch-thumb': {
              color: colors.grey[900],
              boxSizing: 'border-box',
              width: 20,
              height: 20,
            },
            '& .MuiSwitch-track': {
              borderRadius: 24 / 2,
              backgroundColor: colors.grey[500],
              opacity: 1,
            },
          },
        },
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
