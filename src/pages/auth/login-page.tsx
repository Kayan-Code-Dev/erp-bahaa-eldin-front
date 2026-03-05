import { useLoginMutationOptions } from "@/api/v2/auth/auth.hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/zustand-stores/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import * as z from "zod";

// Form Schema validation
const formSchema = z.object({
  email: z.string().email({
    message: "البريد الإلكتروني غير صحيح",
  }),
  password: z.string().min(6, {
    message: "كلمة السر يجب أن تحتوي على 6 أحرف على الأقل",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { mutate, isPending } = useMutation(useLoginMutationOptions());

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Login handler
  const onSubmit = (data: FormValues) => {
    mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (res) => {
          login(res!);
          navigate("/dashboard");
        },
        onError: () => {
          setLoginError(true);
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,hsl(220_25%_98%)_0%,hsl(220_20%_96%)_50%,hsl(220_15%_94%)_100%)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6" dir="rtl">
        {/* Logo + title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-16 w-16 rounded-full bg-white/95 border border-border/70 shadow-lg ring-2 ring-primary/10 flex items-center justify-center overflow-hidden">
            <img
              src="/dressnmore-logo.jpg"
              alt="dressnmore logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              تسجيل الدخول إلى Dressnmore ERP
            </h1>
            <p className="text-[12px] text-muted-foreground">
              أدخل بيانات حسابك للوصول إلى لوحة التحكم وإدارة الفروع والورشة.
            </p>
          </div>
        </div>

        {/* Auth card */}
        <Card className="border border-border/70 shadow-[0_4px_24px_rgb(0_0_0/0.08),0_8px_24px_rgb(0_0_0/0.06)] bg-white">
            <CardContent className="pt-6 pb-7 px-6 md:px-7 flex flex-col gap-6">
              <div className="flex flex-col gap-1 text-right">
              <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
                بيانات الدخول
              </h2>
              <p className="text-[12px] text-muted-foreground">
                البريد الإلكتروني وكلمة المرور المستخدمة لتفعيل حسابك في النظام.
              </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                  dir="rtl"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right text-sm text-muted-foreground font-medium">
                          اسم المستخدم
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="example@dressnmore.com"
                              className="pr-3 pl-9 text-right"
                              {...field}
                            />
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/70" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-right text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right text-sm text-muted-foreground font-medium">
                          كلمة المرور
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pr-3 pl-9"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute left-3 top-2.5 text-muted-foreground/70"
                              aria-label={
                                showPassword
                                  ? "إخفاء كلمة السر"
                                  : "إظهار كلمة السر"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-right text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs">
                    <span className="text-muted-foreground/80">
                      يتم تأمين جلسات النظام تلقائيًا
                    </span>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[11px] md:text-xs text-primary hover:text-primary/90"
                    >
                      <Link to="/forget-password">نسيت كلمة المرور؟</Link>
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-medium text-sm md:text-base py-3.5 shadow-md"
                    variant="default"
                    isLoading={isPending}
                  >
                    تسجيل الدخول إلى الحساب
                  </Button>
                </form>
              </Form>

              <p className="text-[11px] text-muted-foreground text-right">
                يتم مراقبة الأنشطة لحماية بيانات العملاء والموردين، وتشفير حركة
                البيانات بين المتصفح والخادم.
              </p>
            </CardContent>
          </Card>

        {/* Login Error Dialog */}
        <Dialog open={loginError} onOpenChange={setLoginError}>
          <DialogContent className="max-w-md rounded-lg flex flex-col items-center p-6 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <svg
                className="h-12 w-12 text-red-500 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">كلمة المرور غير صحيحة</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              تأكد من صحة بيانات الدخول ثم حاول مرة أخرى.
            </p>
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setLoginError(false)}
                className="w-1/2"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  form.reset();
                  setLoginError(false);
                }}
                className="w-1/2"
              >
                إعادة المحاولة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;
