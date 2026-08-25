"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

type AuthTab = "login" | "signup";

const activeTabClasses =
  "data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground";

export function AuthCard() {
  const [tab, setTab] = useState<AuthTab>("login");

  return (
    <div className="fade-up-item w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
      <Tabs value={tab} onValueChange={(value) => setTab(value as AuthTab)}>
        <TabsList className="h-10 w-full rounded-full bg-muted p-1">
          <TabsTrigger value="login" className={`flex-1 rounded-full ${activeTabClasses}`}>
            Log in
          </TabsTrigger>
          <TabsTrigger value="signup" className={`flex-1 rounded-full ${activeTabClasses}`}>
            Create account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-6">
          <LoginForm onCreateAccount={() => setTab("signup")} />
        </TabsContent>
        <TabsContent value="signup" className="mt-6">
          <SignupForm onLogin={() => setTab("login")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
