import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, Theme, ThemeProvider } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";

// Fonts
import 'non.geist'

// Pages
import Notifications from "./pages/notifications";
import Sidebar from "./pages/global/sidebar";
import AddCompany from "./pages/addCompany";
import Portfolio from "./pages/portfolio";
import AddTrade from "./pages/addTrade";
import Accounts from "./pages/accounts";
import Settings from "./pages/settings";

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
              <Route path="/" element={<Navigate to="/portfolio" replace />} />
              <Route path="/addCompany" element={<AddCompany />} />
              <Route path="/addTrade" element={<AddTrade />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/notifications" element={<Notifications />} />
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
