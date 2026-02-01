import { useMyPermissions } from "@/api/auth/auth.hooks";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

type TProps = {
  permission: string;
};

function PermissionProtectedRoute({ permission }: TProps) {
  const { data, isSuccess, isPending } = useMyPermissions();
  const hasPermission = permission == "" || (data && data.includes(permission));
  const navigate = useNavigate();
  useEffect(() => {
    if (isSuccess && !hasPermission) {
      navigate("/");
    }
  }, [hasPermission, isSuccess]);

  if (isPending) {
    return (
      <div className="flex justify-center">
        {" "}
        <Loader2 className="animate-spin" /> Loading...
      </div>
    );
  }
  return <Outlet />;
}

export default PermissionProtectedRoute;
