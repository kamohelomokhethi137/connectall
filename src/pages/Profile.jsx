import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { FiCamera, FiCheckCircle } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import { useAuth } from "../lib/AuthContext";
import { fetchProfile, updateProfile, uploadAvatar } from "../lib/profile";
import { resolveMediaUrl } from "../lib/api";

export default function Profile() {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchProfile();
      setProfile(data.profile);
      setUsername(data.profile.username);
      setPhone(data.profile.phone || "");
      setEmail(data.profile.email);
    } catch (err) {
      setError(err.message || "Couldn't load your profile.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const data = await updateProfile({ username, phone, email });
        setProfile(data.profile);
        refresh();
        if (data.email_confirmation_sent) {
          toast.success(`Confirmation link sent to ${email}. Your email updates once confirmed.`);
        } else {
          toast.success("Profile updated.");
        }
      } catch (err) {
        toast.error(err.message || "Couldn't update your profile.");
      } finally {
        setSaving(false);
      }
    },
    [username, phone, email, refresh]
  );

  const handleAvatarChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const data = await uploadAvatar(file);
        setProfile(data.profile);
        refresh();
        toast.success("Profile picture updated.");
      } catch (err) {
        toast.error(err.message || "Couldn't upload that image.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [refresh]
  );

  if (error) {
    return (
      <DashboardLayout title="Profile">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout title="Profile">
        <div className="h-64 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl bg-surface rounded-2xl border border-ink/5 p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <img
              src={resolveMediaUrl(`/static/uploads/avatars/${profile.avatar}`)}
              alt="Profile avatar"
              className="w-20 h-20 rounded-full object-cover border border-ink/10"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-teal text-navy flex items-center justify-center border-2 border-white hover:bg-teal-light disabled:opacity-50"
              aria-label="Change profile picture"
            >
              <FiCamera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-display font-semibold text-lg text-ink">@{profile.username}</p>
            <p className="text-sm text-ink-soft flex items-center gap-1.5">
              {profile.is_verified ? (
                <>
                  <FiCheckCircle className="text-teal-dark" size={14} /> Verified account
                </>
              ) : (
                "Not yet verified"
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <FormField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <FormField
            label="Phone number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <FormField
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-xs text-ink-soft -mt-2">
            Changing your email sends a confirmation link to the new address - it only
            updates once you click it.
          </p>
          <SubmitButton loading={saving}>Save changes</SubmitButton>
        </form>
      </div>
    </DashboardLayout>
  );
}
