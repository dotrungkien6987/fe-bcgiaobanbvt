/**
 * NotificationTypeAdminPage
 * Admin page for managing notification types
 * Route: /admin/notification-types
 */

import React, { useState } from "react";
import { Container, Button, Stack, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import {
  NotificationTypeTable,
  NotificationTypeForm,
} from "../features/Notification/Admin";

function NotificationTypeAdminPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const handleEdit = (type) => {
    setSelectedType(type);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedType(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedType(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Quản lý Notification Types</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Thêm Type
        </Button>
      </Stack>

      <NotificationTypeTable onEdit={handleEdit} />

      <NotificationTypeForm
        open={formOpen}
        onClose={handleCloseForm}
        type={selectedType}
      />
    </Container>
  );
}

export default NotificationTypeAdminPage;
