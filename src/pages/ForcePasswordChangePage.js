import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import UserResetPassForm from "../features/User/UserResetPassForm";

function ForcePasswordChangePage() {
  const { user, refreshCurrentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChangeSuccess = async () => {
    await refreshCurrentUser();
    navigate("/", { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <UserResetPassForm
      open={true}
      forcedChange={true}
      handleClose={() => {}}
      onSuccess={handlePasswordChangeSuccess}
      onLogout={handleLogout}
      user={user || {}}
    />
  );
}

export default ForcePasswordChangePage;
