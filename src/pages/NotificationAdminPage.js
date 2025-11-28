

/**
 * NotificationAdminPage
 * Admin page for managing notification templates
 *
 * Features:
 * - Template list with filters
 * - Create/Edit template dialogs
 * - Test notification sending
 */

import React, { useState } from "react";
import { Container, Button, Stack, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import {
  NotificationTemplateTable,
  NotificationTemplateForm,
  NotificationTemplateTest,
} from "../features/Notification/Admin";

/**
 * NotificationAdminPage - Admin template management
 * Route: /admin/notification-templates
 */
function NotificationAdminPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  /**
   * Handle edit template action
   */
  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormOpen(true);
  };

  /**
   * Handle test template action
   */
  const handleTest = (template) => {
    setSelectedTemplate(template);
    setTestOpen(true);
  };

  /**
   * Handle create new template
   */
  const handleCreate = () => {
    setSelectedTemplate(null);
    setFormOpen(true);
  };

  /**
   * Close form dialog
   */
  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedTemplate(null);
  };

  /**
   * Close test dialog
   */
  const handleCloseTest = () => {
    setTestOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Quản lý Notification Templates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Thêm Template
        </Button>
      </Stack>

      {/* Template Table */}
      <NotificationTemplateTable onEdit={handleEdit} onTest={handleTest} />

      {/* Form Dialog */}
      <NotificationTemplateForm
        open={formOpen}
        onClose={handleCloseForm}
        template={selectedTemplate}
      />

      {/* Test Dialog */}
      <NotificationTemplateTest
        open={testOpen}
        onClose={handleCloseTest}
        template={selectedTemplate}
      />
    </Container>
  );
}

export default NotificationAdminPage;
