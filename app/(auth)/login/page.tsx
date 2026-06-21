"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Orbit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { setTokens, saveUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const { user, access_token, refresh_token } = res.data;
      setTokens({ access_token, refresh_token });
      saveUser(user);
      setUser(user);
      toast.success(`Bem-vindo de volta, ${user.name.split(" ")[0]}!`);
      router.push("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Credenciais inválidas";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #2ECFE4, transparent)" }} />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #2ECFE4, #6366f1)" }}>
            <Orbit className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-100">orbit</h1>
          <p className="text-slate-500 text-sm mt-1">seu dinheiro em órbita</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-800 p-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">Entrar na conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@email.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                Esqueci a senha
              </Link>
            </div>

            <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{" "}
            <Link href="/register" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
              Criar conta grátis
            </Link>
          </p>
        </div>

        {/* Demo note */}
        <p className="text-center text-xs text-slate-600 mt-4">
          Fase MVP · Early Adopters
        </p>
      </div>
    </div>
  );
}
