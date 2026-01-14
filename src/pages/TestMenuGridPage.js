import React from "react";
import { Container, Box, Typography, Divider } from "@mui/material";
import { MenuGridPage } from "features/WorkDashboard/components";

/**
 * Test page for MenuGridPage component
 * Route: /test-menu-grid (temporary route for development)
 */
export default function TestMenuGridPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Test MenuGridPage Component
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This is a test page to verify MenuGridPage component functionality
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* MenuGridPage Component */}
        <MenuGridPage />
      </Box>
    </Container>
  );
}
