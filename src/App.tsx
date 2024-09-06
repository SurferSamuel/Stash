import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, Theme, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";

// Fonts
import 'non.geist'

// Pages
import Sidebar from "./pages/global/sidebar";
import AddCompany from "./pages/addCompany";
import AddTrade from "./pages/addTrade";
import Settings from "./pages/setting";
import Portfolio from "./pages/portfolio";

type UseMode = [Theme, { toggleColorMode: () => void }];

function App() {
  const [theme, colorMode] = useMode() as UseMode;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<p>Root</p>} />
              <Route path="/addCompany" element={<AddCompany />} />
              <Route path="/addTrade" element={<AddTrade />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
