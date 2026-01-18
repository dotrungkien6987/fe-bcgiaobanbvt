import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { FeatureFlagProvider } from "./contexts/FeatureFlagContext";
import Router from "./routes";
// import ThemeProvider from "./theme";
// import ThemeCustomization from "theme/index1";
import SplashScreen from "components/SplashScreen";
import { FEATURE_FLAGS } from "config/featureFlags";

function App() {
  const [showSplash, setShowSplash] = useState(
    FEATURE_FLAGS.enableSplashScreen
  );

  useEffect(() => {
    // Simulate initial app loading (e.g., checking auth, loading config)
    // In real implementation, this could await critical API calls
    const timer = setTimeout(() => {
      // App is ready, but splash will continue until animation completes
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen if enabled and not yet completed
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} duration={1200} />;
  }

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
