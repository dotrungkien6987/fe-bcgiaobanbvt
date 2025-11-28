import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import Router from "./routes";
import ThemeProvider from "./theme";
import ThemeCustomization from "theme/index1";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          {/* <ThemeProvider> */}
          {/* <ThemeCustomization> */}

          <Router />
          {/* </ThemeCustomization> */}
          {/* </ThemeProvider> */}
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
