import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import PasswordStrength from "../components/PasswordStrength";
import { apiFetch } from "../lib/api";

const USERNAME_RE = /^[A-Za-z0-9_]+$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const initialForm = {
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: null } : prev));
  }, []);

  // Mirrors the server's RegisterForm validators exactly, so people get
  // instant feedback, but the server re-validates everything again since
  // client-side checks can always be bypassed (disabled JS, direct API
  // calls, a modified request). Never trust the client as the boundary.
  const validate = useCallback(() => {
    const next = {};

    if (!form.username.trim()) next.username = "Choose a username";
    else if (form.username.length < 3 || form.username.length > 30)
      next.username = "3 to 30 characters";
    else if (!USERNAME_RE.test(form.username))
      next.username = "Letters, numbers and underscores only";

    if (!form.email.trim()) next.email = "Enter your email address";
    else if (!EMAIL_RE.test(form.email)) next.email = "That doesn't look like a valid email";

    if (!form.password) next.password = "Create a password";
    else if (form.password.length < 6) next.password = "At least 6 characters";

    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords must match";

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;

      setLoading(true);
      try {
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: {
            username: form.username.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || null,
            password: form.password,
          },
        });
        toast.success("Account created. Check your email to verify.");
        navigate("/login");
      } catch (err) {
        toast.error(err.message || "Couldn't create your account. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [form, validate, navigate]
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free to join. No card required."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-teal-dark font-semibold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField
          label="Username"
          icon={FiUser}
          name="username"
          autoComplete="username"
          placeholder="yourname"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
        />
        <FormField
          label="Email address"
          icon={FiMail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          label="Phone (optional)"
          icon={FiPhone}
          name="phone"
          autoComplete="tel"
          placeholder="+266 5xxxxxxx"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <div>
          <FormField
            label="Password"
            icon={FiLock}
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <PasswordStrength password={form.password} />
        </div>
        <FormField
          label="Confirm password"
          icon={FiLock}
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Type your password again"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>
    </AuthLayout>
  );
}
