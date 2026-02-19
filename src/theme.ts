import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';

import { createTheme } from '@mui/material/styles';

/**
 * Palette usage:
 *
 * 100:
 *  - Primary text
 *
 * 200:
 *
 * 300:
 *  - Secondary text
 *
 * 400:
 *
 * 500:
 *  - Primary border
 *
 * 600:
 *  - Sidebar selected bg
 *  - Dialog outline
 *
 * 700:
 *  - Sidebar hover bg
 *
 * 800:
 *  - Table header bg
 *  - Secondary border
 *
 * 900:
 *  - Main bg
 */

const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: {
        grey: {
          100: '#ffffff',
          200: '#bbbbbb',
          300: '#8b8b8f',
          400: '#7a7a7f',
          500: '#3a3a3b',
          600: '#2e2e2f',
          700: '#212122',
          800: '#151518',
          900: '#09090b',
        },
        blueAccent: {
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        primary: {
          main: '#ffffff',
        },
        secondary: {
          main: '#8b8b8f',
        },
        background: {
          default: '#09090b',
        },
        text: {
          primary: '#ffffff',
        },
        success: {
          light: '#00ff38',
          main: '#007d1c',
          dark: '#004f11',
          contrastText: '#ffffff',
        },
        error: {
          light: '#e57373',
          main: '#d43a2f',
          dark: '#d32f2f',
          contrastText: '#ffffff',
        },
      },
    },
    light: {
      palette: {
        grey: {
          100: '#141414',
          200: '#292929',
          300: '#3d3d3d',
          400: '#424242',
          500: '#646464',
          600: '#cecece',
          700: '#dfdfdf',
          800: '#efefef',
          900: '#ffffff',
        },
        blueAccent: {
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        primary: {
          main: '#141414',
        },
        secondary: {
          main: '#3d3d3d',
        },
        background: {
          default: '#ffffff',
        },
        text: {
          primary: '#000000',
        },
        success: {
          light: '#00ff38',
          main: '#007d1c',
          dark: '#004f11',
          contrastText: '#ffffff',
        },
        error: {
          light: '#e57373',
          main: '#d43a2f',
          dark: '#d32f2f',
          contrastText: '#ffffff',
        },
      },
    },
  },
  typography: {
    fontFamily: 'Geist Variable, Arial, sans-serif',
    fontSize: 12,
    h1: {
      fontFamily: 'Geist Variable, Arial, sans-serif',
      fontSize: 40,
    },
    h2: {
      fontFamily: 'Geist Variable, Arial, sans-serif',
      fontSize: 32,
    },
    h3: {
      fontFamily: 'Geist Variable, Arial, sans-serif',
      fontSize: 24,
    },
    h4: {
      fontFamily: 'Geist Variable, Arial, sans-serif',
      fontSize: 20,
    },
    h5: {
      fontFamily: 'Geist Variable, Arial, sans-serif',
      fontSize: 16,
    },
    h6: {
      fontFamily: 'Geist Variable, Arial, sans-serif',
      fontSize: 15,
    },
  },
  components: {
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          gridColumn: 'span 4',
          backgroundColor: theme.palette.grey[900],
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
        }),
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.grey[900],
          padding: 0,
        }),
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.grey[900],
          '& .MuiAccordionSummary-content': {
            marginLeft: '10px',
          },
        }),
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
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.grey[900],
          backgroundImage: 'none',
          boxShadow: 'none',
          marginTop: '4px',
          border: `1px solid ${theme.palette.grey[600]}`,
        }),
        listbox: {
          padding: '0px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: 14,
        },
        contained: {
          fontWeight: 600,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.palette.grey[600]} ${theme.palette.grey[900]}`,
          },
        },
      }),
    },
    MuiDataGrid: {
      defaultProps: {
        hideFooter: true,
        disableColumnMenu: true,
        disableRowSelectionOnClick: true,
        resizeThrottleMs: 300,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: 'none',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          '--DataGrid-rowBorderColor': theme.palette.grey[500],
          '& .MuiDataGrid-columnHeader--last .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
        }),
        columnHeader: ({ theme }) => ({
          paddingLeft: '8px',
          paddingRight: '8px',
          fontWeight: 500,
          fontSize: 14.5,
          color: theme.palette.grey[100],
          backgroundColor: theme.palette.grey[800],
        }),
        'row--lastVisible': ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.grey[500]}`,
        }),
        columnHeaders: ({ theme }) => ({
          '&:hover .MuiDataGrid-columnSeparator': {
            color: theme.palette.grey[500],
          },
        }),
        withBorderColor: ({ theme }) => ({
          borderColor: theme.palette.grey[500],
        }),
        cell: {
          fontSize: 14,
        },
        columnSeparator: {
          color: 'transparent',
        },
        columnsManagementHeader: {
          paddingLeft: '12px',
          paddingRight: '12px',
        },
        columnHeaderTitle: {
          fontSize: 15,
          textTransform: 'none',
        },
        sortIcon: {
          margin: '-3px',
        },
      },
    },
    MuiPickerPopper: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.grey[900],
          backgroundImage: 'none',
          boxShadow: 'none',
          marginTop: '4px',
          border: `1px solid ${theme.palette.grey[600]}`,
          '.MuiButtonBase-root.Mui-selected:focus': {
            backgroundColor: theme.palette.grey[100],
          },
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.grey[900],
          backgroundImage: 'none',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.grey[600]}`,
          '.MuiButtonBase-root.Mui-selected:focus': {
            backgroundColor: theme.palette.grey[600],
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.grey[900],
          backgroundImage: 'none',
          borderRadius: '8px',
          border: `1px solid ${theme.palette.grey[600]}`,
          boxShadow: 'none',
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: 20,
          fontWeight: 600,
          paddingBottom: '0px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingTop: '16px !important',
          marginBottom: '-6px',
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.grey[300],
          fontSize: 15,
          fontWeight: 400,
        }),
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          paddingLeft: '25px',
          paddingRight: '25px',
          paddingBottom: '25px',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.grey[500],
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: 12,
          fontWeight: 600,
          margin: '0px 0px 0px 6px',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          marginRight: '0px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .Mui-disabled:hover': {
            cursor: 'not-allowed',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[500],
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[500],
          },
        }),
      },
    },
    MuiSwitch: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
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
                backgroundColor: theme.palette.grey[100],
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
            color: theme.palette.grey[900],
            boxSizing: 'border-box',
            width: 20,
            height: 20,
          },
          '& .MuiSwitch-track': {
            borderRadius: 24 / 2,
            backgroundColor: theme.palette.grey[500],
            opacity: 1,
          },
        }),
      },
    },
  },
});

export default theme;
