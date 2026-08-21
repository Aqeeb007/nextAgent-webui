"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/features/auth/hooks/use-register";
import { getErrorMessage } from "@/lib/api/error";

interface SignupFormProps {
  onLogin?: () => void;
}

export function SignupForm({ onLogin }: SignupFormProps) {
  const router = useRouter();
  const { mutate, isPending, error } = useRegisterMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    mutate(
      {
        firstName: String(formData.get("firstName")),
        lastName: String(formData.get("lastName")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      },
      { onSuccess: () => router.push("/") }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Set up your workspace in a couple of minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-first-name">First name</Label>
            <Input
              id="signup-first-name"
              name="firstName"
              type="text"
              placeholder="Ada"
              autoComplete="given-name"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-last-name">Last name</Label>
            <Input
              id="signup-last-name"
              name="lastName"
              type="text"
              placeholder="Lovelace"
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-10 w-full text-sm"
        >
          {isPending && <Loader2 className="animate-spin" />}
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onLogin}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
