"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/features/auth/hooks/use-login";
import { getErrorMessage } from "@/lib/api/error";

interface LoginFormProps {
  onCreateAccount?: () => void;
}

export function LoginForm({ onCreateAccount }: LoginFormProps) {
  const router = useRouter();
  const { mutate, isPending, error } = useLoginMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    mutate(
      {
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      },
      { onSuccess: () => router.push("/dashboard") }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back — pick up where you left off.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
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
          {isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm">
        <span className="text-muted-foreground">Forgot password? Coming soon</span>
        <span className="text-muted-foreground">
          No account?{" "}
          <button
            type="button"
            onClick={onCreateAccount}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </button>
        </span>
      </div>
    </div>
  );
}
