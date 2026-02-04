"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DemoBanner } from "@/components/auth/DemoBanner";
import { VALIDATION } from "@/lib/types";
import { DEMO_AUTH_MODE } from "@/lib/config";

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function SignUpForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(values.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!values.password) {
      newErrors.password = "Password is required";
    } else if (values.password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
    }

    // Confirm password validation
    if (!values.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // In demo mode, simulate successful sign-up and redirect
    if (DEMO_AUTH_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/dashboard");
      return;
    }

    // Real auth mode: dynamically import and use Better Auth
    try {
      const { signUp } = await import("@/lib/auth");
      const result = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.email.split("@")[0],
      });

      if (result.error) {
        if (result.error.message?.includes("already exists")) {
          setSubmitError("An account with this email already exists");
        } else {
          setSubmitError(result.error.message || "Sign up failed. Please try again.");
        }
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DemoBanner />

      <h2 className="text-xl font-semibold text-neutral-900 text-center">
        Create an account
      </h2>

      {submitError && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange("email")}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isSubmitting}
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange("password")}
        error={errors.password}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={handleChange("confirmPassword")}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        Sign Up
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <a
          href="/sign-in"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
