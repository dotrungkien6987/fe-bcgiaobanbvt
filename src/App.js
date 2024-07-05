import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Router from "./routes";
import ThemeProvider from "./theme";
import ThemeCustomization from "theme/index1";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* <ThemeProvider> */}
        {/* <ThemeCustomization> */}

          <Router />
        {/* </ThemeCustomization> */}
        {/* </ThemeProvider> */}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
