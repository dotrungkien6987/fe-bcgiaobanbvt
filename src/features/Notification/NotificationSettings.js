/**
 * NotificationSettings Component
 * User notification preferences management
 *
 * Features:
 * - Global notification toggle
 * - Push notification toggle
 * - Quiet hours configuration
 * - Per-type notification settings (in-app and push)
 */

import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  TextField,
  Skeleton,
  Alert,
  Container,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "./notificationSlice";

/**
 * NotificationSettings - User preferences for notifications
 * Route: /cai-dat/thong-bao
 */
function NotificationSettings() {
  const dispatch = useDispatch();
  const { settings, availableTypes, isLoading, error } = useSelector(
    (state) => state.notification
  );

  // Fetch settings on mount
  useEffect(() => {
    dispatch(getNotificationSettings());
  }, [dispatch]);

  /**
   * Handle global toggle switches
   */
  const handleGlobalToggle = (field) => (event) => {
    dispatch(
      updateNotificationSettings({
        [field]: event.target.checked,
      })
    );
  };

  /**
   * Handle quiet hours enabled toggle
   */
  const handleQuietHoursToggle = (event) => {
    dispatch(
      updateNotificationSettings({
        quietHours: {
          ...settings.quietHours,
          enabled: event.target.checked,
        },
      })
    );
  };

  /**
   * Handle quiet hours time change
   */
  const handleQuietHoursChange = (field) => (event) => {
    dispatch(
      updateNotificationSettings({
        quietHours: {
          ...settings.quietHours,
          [field]: event.target.value,
        },
      })
    );
  };

  /**
   * Handle per-type notification toggle
   */
  const handleTypeToggle = (type, channel) => (event) => {
    const currentPrefs = settings.typePreferences?.[type] || {
      inapp: true,
      push: true,
    };
    dispatch(
      updateNotificationSettings({
        typePreferences: {
          [type]: {
            ...currentPrefs,
            [channel]: event.target.checked,
          },
        },
      })
    );
  };

  // Loading state
  if (isLoading && !settings) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // No settings yet (shouldn't happen after API returns)
  if (!settings) return null;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cài đặt thông báo
      </Typography>

      {/* Global Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cài đặt chung
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableNotifications}
                  onChange={handleGlobalToggle("enableNotifications")}
                />
              }
              label="Bật thông báo"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enablePush}
                  onChange={handleGlobalToggle("enablePush")}
                  disabled={!settings.enableNotifications}
                />
              }
              label="Bật push notification (trình duyệt)"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Giờ yên tĩnh
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Không gửi push notification trong khoảng thời gian này
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.quietHours?.enabled || false}
                onChange={handleQuietHoursToggle}
                disabled={!settings.enableNotifications || !settings.enablePush}
              />
            }
            label="Bật giờ yên tĩnh"
          />

          {settings.quietHours?.enabled && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Từ"
                  value={settings.quietHours?.start || "22:00"}
                  onChange={handleQuietHoursChange("start")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Đến"
                  value={settings.quietHours?.end || "07:00"}
                  onChange={handleQuietHoursChange("end")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Per-Type Settings */}
      {availableTypes && availableTypes.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cài đặt theo loại thông báo
            </Typography>

            {availableTypes.map((type, index) => {
              const prefs = settings.typePreferences?.[type.type] || {
                inapp: true,
                push: true,
              };

              return (
                <React.Fragment key={type.type}>
                  {index > 0 && <Divider sx={{ my: 2 }} />}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {type.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={prefs.inapp}
                            onChange={handleTypeToggle(type.type, "inapp")}
                            disabled={!settings.enableNotifications}
                          />
                        }
                        label="In-app"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={prefs.push}
                            onChange={handleTypeToggle(type.type, "push")}
                            disabled={
                              !settings.enableNotifications ||
                              !settings.enablePush
                            }
                          />
                        }
                        label="Push"
                      />
                    </Box>
                  </Box>
                </React.Fragment>
              );
            })}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default NotificationSettings;
