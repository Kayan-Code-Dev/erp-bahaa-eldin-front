import { useLoginMutationOptions } from "@/api/v2/auth/auth.hooks";
import logo from "@/assets/app-logo.svg";
import loginImage from "@/assets/login-image.png";
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
          navigate("/");
        },
        onError: () => {
          setLoginError(true);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full flex flex-row flex-1 min-h-[calc(100vh-80px)]">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 min-h-full">
          {/* Logo */}
          <div className="mb-8 text-center">
            <img
              src={logo}
              alt="Baha Eldin Logo"
              className="h-30 mx-auto mb-2"
            />
          </div>

          <Card className="w-full max-w-md border-none shadow-none bg-gray-200">
            <CardContent className="pt-6 flex flex-col gap-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right text-gray-700 font-medium">
                          اسم المستخدم
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="yousef@gmail.com"
                              className="pl-10 text-right"
                              {...field}
                            />
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-right" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className=" text-gray-700 font-medium">
                          كلمة السر
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="password"
                              className="pl-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute left-3 top-2.5 text-gray-400"
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
                        <FormMessage className="text-right" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full font-medium text-lg py-6 bg-[#64A5FF] cursor-pointer hover:bg-[#64a5ffee]"
                    variant={"default"}
                    isLoading={isPending}
                  >
                    تسجيل الدخول
                  </Button>
                </form>
                <div className="flex justify-start -mt-2">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm text-gray-600 hover:text-primary"
                  >
                    <Link to="/forget-password">نسيت كلمة السر؟</Link>
                  </Button>
                </div>
              </Form>
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
              <h2 className="text-xl font-bold mb-2">كلمة المرور خطأ</h2>
              <p className="mb-6">أعد التسجيل مرة اخرى</p>
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
                  تأكيد
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 min-h-full">
          <div className="max-w-md w-full">
            <div className="relative h-64 md:h-96">
              <img
                src={loginImage}
                alt="Login Illustration"
                className="object-contain h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-white border-t mt-auto py-3">
        <div className="text-center text-sm text-gray-500">
          <span>
            للدعم الفني يرجى التواصل على{" "}
            <span className="text-primary font-semibold">00201070205189</span>
          </span>
        </div>
        <div className="text-center text-xs text-gray-400 mt-1">
          تصميم وتطوير{" "}
          <a
            href="https://highleveltecknology.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold"
          >
            High Level Technology
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Login;
