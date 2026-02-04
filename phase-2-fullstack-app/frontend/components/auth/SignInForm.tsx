"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DemoBanner } from "@/components/auth/DemoBanner";
import { DEMO_AUTH_MODE } from "@/lib/config";

interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export function SignInForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    email: "",
    password: "",
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

    // In demo mode, simulate successful sign-in and redirect
    if (DEMO_AUTH_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/dashboard");
      return;
    }

    // Real auth mode: dynamically import and use Better Auth
    try {
      const { signIn } = await import("@/lib/auth");
      console.log("Attempting sign in with:", values.email);

      const result = await signIn.email({
        email: values.email,
        password: values.password,
      });

      console.log("Sign in result:", result);

      if (result.error) {
        console.error("Sign in error:", result.error);
        if (result.error.message?.includes("invalid") || result.error.message?.includes("credentials")) {
          setSubmitError("Invalid email or password");
        } else {
          setSubmitError(result.error.message || "Sign in failed. Please try again.");
        }
        return;
      }

      // Redirect to dashboard on success
      console.log("Sign in successful, redirecting to dashboard...");
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign in catch error:", error);
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
        Sign in to your account
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
        placeholder="Enter your password"
        autoComplete="current-password"
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        Sign In
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <a
          href="/sign-up"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign up
        </a>
      </p>
    </form>
  );
}
