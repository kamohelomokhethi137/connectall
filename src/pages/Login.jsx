import { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiLock } from "react-icons/fi";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // useCallback so this function identity is stable across re-renders,
  // instead of being recreated (and re-triggering child re-renders)
  // on every keystroke.
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: null } : prev));
  }, []);

  const validate = useCallback(() => {
    const next = {};
    if (!form.email.trim()) next.email = "Enter your email address";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "That doesn't look like a valid email";
    if (!form.password) next.password = "Enter your password";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;

      setLoading(true);
      try {
        // Backend note: this endpoint must set an httpOnly session
        // cookie on success rather than returning a token in the JSON
        // body, so client-side JS never touches the credential directly.
        await apiFetch("/api/auth/login", {
          method: "POST",
          body: { email: form.email, password: form.password },
        });
        await refresh();
        toast.success("Welcome back");
        navigate(location.state?.from || "/feed", { replace: true });
      } catch (err) {
        // Deliberately generic message: never reveal whether the email
        // or the password was the wrong one, that alone is an
        // information leak that helps an attacker enumerate accounts.
        toast.error(err.message || "Couldn't sign you in. Check your details and try again.");
      } finally {
        setLoading(false);
      }
    },
    [form, validate, navigate, location, refresh]
  );

  return (
    <AuthLayout
      title="Log in to your account"
      subtitle="Welcome back. Pick up where you left off."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-teal-dark font-semibold hover:underline">
            Sign up free
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
          label="Password"
          icon={FiLock}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-soft">
            <input
              type="checkbox"
              name="remember"
              className="rounded border-ink/20 text-teal focus:ring-teal/30"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-teal-dark font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={loading}>Log in</SubmitButton>
      </form>
    </AuthLayout>
  );
}
