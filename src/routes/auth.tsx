import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Australian Druze Community" },
      { name: "description", content: "Members-only access to the Australian Druze Community platform." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[color:var(--brand-home-soft)] to-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="size-14 rounded-2xl bg-[color:var(--brand-home)] flex items-center justify-center shadow-card mb-4">
            <Users className="size-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Australian Druze Community</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay connected. Stay informed. Stay involved.</p>
        </div>

        <div className="bg-card border rounded-2xl shadow-card p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><LoginForm /></TabsContent>
            <TabsContent value="register"><RegisterForm onDone={() => setTab("login")} /></TabsContent>
          </Tabs>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">A private community platform for ADC members.</p>
      </div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/home", replace: true });
  }

  async function onReset() {
    if (!email) return toast.error("Enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-[color:var(--brand-home)] hover:bg-[color:var(--brand-home)]/90 text-white">
        {loading ? "Signing in…" : "Login"}
      </Button>
      <button type="button" onClick={onReset} className="block w-full text-sm text-muted-foreground hover:text-foreground text-center">
        Forgot password?
      </button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", mobile: "", suburb: "", password: "", confirm: "",
  });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (!agree) return toast.error("Please accept the Terms & Privacy Policy");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: {
          first_name: form.first_name,
          last_name: form.last_name,
          mobile: form.mobile,
          suburb: form.suburb,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you can sign in now");
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="fn">First name</Label>
          <Input id="fn" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ln">Last name</Label>
          <Input id="ln" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="em">Email</Label>
        <Input id="em" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="mb">Mobile</Label>
          <Input id="mb" type="tel" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sb">Suburb</Label>
          <Input id="sb" value={form.suburb} onChange={(e) => set("suburb", e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw">Password</Label>
        <Input id="pw" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cf">Confirm password</Label>
        <Input id="cf" type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} required />
      </div>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <Checkbox checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} className="mt-0.5" />
        <span>I agree to the <Link to="/auth" className="underline">Terms & Privacy Policy</Link></span>
      </label>
      <Button type="submit" disabled={loading} className="w-full bg-[color:var(--brand-home)] hover:bg-[color:var(--brand-home)]/90 text-white">
        {loading ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
