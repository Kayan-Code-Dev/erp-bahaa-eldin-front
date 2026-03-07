import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/zustand-stores/auth.store";
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useDeleteAccount,
} from "@/api/v2/account/account.hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Lock, Trash2, Upload, Loader2 } from "lucide-react";

export default function AccountSettings() {
  const navigate = useNavigate();
  const { loginData, logout } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const displayName = profile?.name ?? loginData?.user?.name ?? "";
  const displayEmail = profile?.email ?? loginData?.user?.email ?? "";

  const [name, setName] = useState(displayName);
  const [email, setEmail] = useState(displayEmail);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deletePassword, setDeletePassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarRemove, setAvatarRemove] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoRemove, setLogoRemove] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();

  useEffect(() => {
    if (displayName) setName(displayName);
    if (displayEmail) setEmail(displayEmail);
  }, [displayName, displayEmail]);


  const userInitials = (displayName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const avatarUrl = profile?.avatar_url ?? profile?.avatar ?? null;
  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile]
  );
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);
  const defaultLogoUrl = "/dressnmore-logo.jpg";
  const displayAvatarUrl = avatarRemove
    ? null
    : (avatarPreview ?? avatarUrl ?? defaultLogoUrl);

  const logoUrl =
    (profile as any)?.logo_url ?? (profile as any)?.logo ?? null;
  const logoPreview = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile]
  );
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);
  const displayLogoUrl = logoRemove
    ? null
    : (logoPreview ?? logoUrl ?? defaultLogoUrl);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        name,
        email,
        avatar: avatarFile ?? undefined,
        avatar_remove: avatarRemove || undefined,
        logo: logoFile ?? undefined,
        logo_remove: logoRemove || undefined,
      },
      {
        onSuccess: () => {
          setAvatarFile(null);
          setAvatarRemove(false);
          setLogoFile(null);
          setLogoRemove(false);
          if (avatarInputRef.current) avatarInputRef.current.value = "";
          if (logoInputRef.current) logoInputRef.current.value = "";
        },
      }
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword.mutate(
      {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAvatarFile(file ?? null);
    if (file) setAvatarRemove(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoFile(file ?? null);
    if (file) setLogoRemove(false);
  };

  const handleDeleteAccount = () => {
    deleteAccount.mutate(deletePassword, {
      onSuccess: () => {
        logout();
        navigate("/login");
      },
    });
  };

  if (profileLoading) {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen w-full p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إعدادات الحساب</h1>
        <p className="text-muted-foreground text-sm mt-1">
          إدارة معلومات حسابك وإعدادات الأمان
        </p>
      </div>

      <Tabs defaultValue="profile" dir="rtl">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Lock className="h-4 w-4" />
            كلمة المرور
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 text-destructive data-[state=active]:text-destructive">
            <Trash2 className="h-4 w-4" />
            حذف الحساب
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب والشعارات</CardTitle>
              <CardDescription>
                تعديل الاسم، البريد الإلكتروني، والصورة الشخصية، بالإضافة إلى رفع شعار يظهر في النظام والفواتير
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-8 items-start">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-2 border-muted shrink-0">
                    <AvatarImage src={displayAvatarUrl ?? undefined} alt="الصورة الشخصية" />
                    <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      هذه هي الصورة الشخصية التي تظهر في الهيدر والسايد بار.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="ml-2 h-4 w-4" />
                        اختيار صورة شخصية
                      </Button>
                      {(avatarUrl || avatarFile) && !avatarRemove && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => {
                            setAvatarRemove(true);
                            setAvatarFile(null);
                            if (avatarInputRef.current) avatarInputRef.current.value = "";
                          }}
                        >
                          <Trash2 className="ml-2 h-4 w-4" />
                          إزالة الصورة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full border-2 border-dashed border-muted flex items-center justify-center bg-muted/40 overflow-hidden">
                    <img
                      src={displayLogoUrl ?? "/dressnmore-logo.jpg"}
                      alt="شعار الحساب"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      الشعار يمكن استخدامه في الفواتير والتقارير. يفضل استخدام ملف PNG بخلفية شفافة.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="ml-2 h-4 w-4" />
                        اختيار شعار
                      </Button>
                      {(logoUrl || logoFile) && !logoRemove && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => {
                            setLogoRemove(true);
                            setLogoFile(null);
                            if (logoInputRef.current) logoInputRef.current.value = "";
                          }}
                        >
                          <Trash2 className="ml-2 h-4 w-4" />
                          إزالة الشعار
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسمك"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                </div>
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                  >
                  {updateProfile.isPending && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  حفظ التغييرات (الاسم، البريد، والشعار/الصورة)
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>تغيير كلمة المرور</CardTitle>
              <CardDescription>تأكد من استخدام كلمة مرور قوية</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة"
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    required
                    minLength={8}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  تغيير كلمة المرور
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">منطقة الخطر</CardTitle>
              <CardDescription>
                حذف الحساب نهائياً. هذا الإجراء لا يمكن التراجع عنه.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف الحساب نهائياً
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم حذف حسابك وجميع بياناتك نهائياً. لا يمكن التراجع عن
                      هذا الإجراء. أدخل كلمة المرور للتأكيد.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-2">
                    <Label htmlFor="delete-password">كلمة المرور</Label>
                    <Input
                      id="delete-password"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="أدخل كلمة المرور للتأكيد"
                      className="mt-2"
                    />
                  </div>
                  <AlertDialogFooter className="flex-row-reverse gap-2">
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={!deletePassword || deleteAccount.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteAccount.isPending && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      حذف الحساب
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
