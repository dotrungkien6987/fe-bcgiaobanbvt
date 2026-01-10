import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { FeatureFlagProvider } from "./contexts/FeatureFlagContext";
import Router from "./routes";
import ThemeProvider from "./theme";
import ThemeCustomization from "theme/index1";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <FeatureFlagProvider>
          <BrowserRouter>
            {/* <ThemeProvider> */}
            {/* <ThemeCustomization> */}

            <Router />
            {/* </ThemeCustomization> */}
            {/* </ThemeProvider> */}
          </BrowserRouter>
        </FeatureFlagProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
