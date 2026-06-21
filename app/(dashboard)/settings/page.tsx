"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Shield, Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { saveUser } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  timezone: z.string(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const { data: me } = useQuery({
    queryKey: ["users", "me"],
    queryFn: () => usersApi.me().then((r) => r.data),
    initialData: user ?? undefined,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: me?.name ?? "", timezone: me?.timezone ?? "America/Sao_Paulo" },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) => usersApi.update(data),
    onSuccess: (res) => {
      saveUser(res.data);
      setUser(res.data);
      toast.success("Perfil atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar perfil"),
  });

  const TIMEZONES = [
    "America/Sao_Paulo",
    "America/Manaus",
    "America/Fortaleza",
    "America/Belem",
    "America/Cuiaba",
    "America/Porto_Velho",
    "America/Rio_Branco",
    "America/Noronha",
  ];

  return (
    <div>
      <Header title="Configurações" subtitle="Gerencie sua conta e preferências" />

      <div className="p-6 space-y-6 animate-fade-in max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <User className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
            <Input
              label="Nome completo"
              error={errors.name?.message}
              {...register("name")}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">E-mail</label>
              <input
                type="email"
                value={me?.email ?? ""}
                disabled
                className="w-full rounded-xl border border-navy-700 bg-navy-900/50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-600">O e-mail não pode ser alterado</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Fuso horário</label>
              <select
                {...register("timezone")}
                className="w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm text-slate-100 focus:border-teal-400/60 focus:outline-none transition-all"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace("America/", "")}</option>
                ))}
              </select>
            </div>
            <Button type="submit" loading={isSubmitting}>Salvar alterações</Button>
          </form>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <Shield className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-200">Autenticação JWT</p>
                <p className="text-xs text-slate-500">Token de 15 minutos com refresh automático</p>
              </div>
              <span className="text-xs text-success">Ativo</span>
            </div>
            <div className="border-t border-navy-700/50 pt-3">
              <Button variant="outline" size="sm">Alterar senha</Button>
            </div>
          </div>
        </Card>

        {/* Notifications placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <Bell className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <div className="space-y-3">
            {[
              { label: "Alerta de limite diário", desc: "Aviso quando atingir 80% do limite" },
              { label: "Orçamento mensal", desc: "Resumo semanal do seu progresso" },
              { label: "Transação recebida", desc: "Push quando uma nova transação entra" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-navy-700/30 last:border-0">
                <div>
                  <p className="text-sm text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-navy-700 rounded-full peer peer-checked:bg-teal-400 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="border-danger/20">
          <CardHeader>
            <CardTitle className="text-danger">Zona de perigo</CardTitle>
            <Trash2 className="h-4 w-4 text-danger" />
          </CardHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              A exclusão da conta remove todos os seus dados permanentemente e revoga todos os consentimentos Open Finance. Essa ação não pode ser desfeita.
            </p>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm("Tem certeza? Todos os seus dados serão apagados permanentemente.")) {
                  toast.error("Funcionalidade disponível em breve");
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Excluir minha conta
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
