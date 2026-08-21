import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignupFormProps {
  onLogin?: () => void;
}

export function SignupForm({ onLogin }: SignupFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Set up your workspace in a couple of minutes.
        </p>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-name">Full name</Label>
          <Input
            id="signup-name"
            name="name"
            type="text"
            placeholder="Ada Lovelace"
            autoComplete="name"
            required
          />
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
            required
          />
        </div>

        <Button type="submit" className="mt-2 h-10 w-full text-sm">
          Create account
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
