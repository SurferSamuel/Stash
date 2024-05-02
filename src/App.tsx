import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, Theme, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";

// Scenes
import Sidebar from "./scenes/global/sidebar";
import AddCompany from "./scenes/addCompany";
import SellShares from "./scenes/sellShares";
import BuyShares from "./scenes/buyShares";
import Settings from "./scenes/setting";

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
              <Route path="/add" element={<AddCompany />} />
              <Route path="/buy" element={<BuyShares />} />
              <Route path="/sell" element={<SellShares />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
