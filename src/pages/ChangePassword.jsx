import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FiLock } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import PasswordStrength from "../components/PasswordStrength";
import { changePassword } from "../lib/profile";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (newPassword.length < 8) {
        toast.error("New password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords don't match.");
        return;
      }
      setSaving(true);
      try {
        await changePassword(currentPassword, newPassword);
        toast.success("Password updated. A confirmation email has been sent.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        toast.error(err.message || "Couldn't change your password.");
      } finally {
        setSaving(false);
      }
    },
    [currentPassword, newPassword, confirmPassword]
  );

  return (
    <DashboardLayout title="Change Password">
      <div className="max-w-md bg-surface rounded-2xl border border-ink/5 p-6">
        <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
          <FiLock className="text-teal-dark" aria-hidden="true" />
          Update your password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div>
            <FormField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <PasswordStrength password={newPassword} />
          </div>
          <FormField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <SubmitButton loading={saving}>Change password</SubmitButton>
        </form>
      </div>
    </DashboardLayout>
  );
}
