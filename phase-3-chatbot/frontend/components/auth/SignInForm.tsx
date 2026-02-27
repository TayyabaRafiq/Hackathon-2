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
  console.log("🔵 SignInForm component loaded - VERSION 2.0");

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
  e.stopPropagation();

  setSubmitError(null);

  if (!validateForm()) return;

  setIsSubmitting(true);

  if (DEMO_AUTH_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/dashboard");
    return;
  }

  try {
    const { signIn } = await import("@/lib/auth");

    console.log("🔐 [SignIn] Starting sign in for:", values.email);
    const result = await signIn.email({
      email: values.email,
      password: values.password,
    });

    console.log("🔐 [SignIn] Raw result:", JSON.stringify(result, null, 2));

    // Better Auth can return error in result.error or result itself might be an error
    if (result?.error) {
      console.error("🔐 [SignIn] Error in result.error:", result.error);
      setSubmitError(result.error.message || "Invalid email or password");
      setIsSubmitting(false);
      return;
    }

    // Check if result has data property (Better Auth response format)
    if (result?.data === null || result?.data === undefined) {
      console.error("🔐 [SignIn] No data in result, treating as error");
      setSubmitError("Sign in failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    console.log("🔐 [SignIn] ✅ Sign in successful!");
    console.log("🔐 [SignIn] User data:", result.data || result);
    console.log("🔐 [SignIn] 🚀 Redirecting to /dashboard...");

    setIsSubmitting(false);

    // Force hard redirect to ensure session is loaded
    console.log("🔐 [SignIn] 🔄 Executing window.location.href...");
    window.location.href = "/dashboard";
    console.log("🔐 [SignIn] ⚠️ This line should not appear if redirect worked");

  } catch (error) {
    console.error("🔐 [SignIn] Exception caught:", error);
    setSubmitError("An unexpected error occurred. Please try again.");
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
