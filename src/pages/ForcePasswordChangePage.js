import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import UserResetPassForm from "../features/User/UserResetPassForm";

function ForcePasswordChangePage() {
  const { user, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChangeSuccess = async () => {
    await refreshCurrentUser();
    navigate("/", { replace: true });
  };

  return (
    <UserResetPassForm
      open={true}
      forcedChange={true}
      handleClose={() => {}}
      onSuccess={handlePasswordChangeSuccess}
      user={user || {}}
    />
  );
}

export default ForcePasswordChangePage;
