"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Orbit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { setTokens, saveUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Inclua pelo menos um número"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "As senhas não coincidem",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ name, email, password }: FormData) => {
    try {
      const res = await authApi.register({ name, email, password });
      const { user, access_token, refresh_token } = res.data;
      setTokens({ access_token, refresh_token });
      saveUser(user);
      setUser(user);
      toast.success("Conta criada! Bem-vindo ao Orbit 🚀");
      router.push("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Erro ao criar conta";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #2ECFE4, #6366f1)" }}>
            <Orbit className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-100">orbit</h1>
          <p className="text-slate-500 text-sm mt-1">controle financeiro sem fricção</p>
        </div>

        <div className="rounded-2xl border border-navy-700/50 bg-navy-800 p-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">Criar conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              type="text"
              placeholder="Lucas Ferreira"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register("name")}
            />
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
              hint="Mínimo 8 caracteres, 1 maiúscula e 1 número"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirm_password?.message}
              {...register("confirm_password")}
            />

            <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
              Criar conta grátis
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
              Entrar
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Seus dados bancários são protegidos via Open Finance Brasil
        </p>
      </div>
    </div>
  );
}
