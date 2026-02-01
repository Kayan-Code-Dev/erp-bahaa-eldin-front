import { api } from "@/api/api-contants";
import { TPermission } from "./permissions.types";
import { populateError } from "@/api/api.utils";

export const getPermissionsList = async () => {
  try {
    const { data } = await api.get<{
      data: TPermission[];
    }>("/permissions");
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في جلب قائمة الصلاحيات");
  }
};

export const getPermissionsByRoleId = async (roleId: number) => {
  try {
    const { data } = await api.get<{
      permissions: TPermission[];
    }>(`/roles/${roleId}/permissions`);
    return data.permissions;
  } catch (error) {
    populateError(error, "خطأ في جلب الصلاحيات المخصصة للدور");
  }
};

export const assignPermissionsToRole = async (
  roleId: number,
  permissions: string[]
) => {
  try {
    const { data } = await api.post<{
      data: TPermission[];
    }>(`/roles/${roleId}/permissions`, {
      permissions,
    });
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في تخصيص الصلاحيات للدور");
  }
};

export const togglePermissionForRole = async (roleId: number, name: string) => {
  try {
    const { data } = await api.post<{
      data: TPermission[];
    }>(`/roles/${roleId}/permissions/toggle`, {
      permission: name,
    });
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في تفعيل الصلاحية للدور");
  }
};

export const getMyPermissions = async () => {
  try {
    const { data } = await api.get<{
      data: TPermission[];
    }>("/me/permissions");
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في جلب الصلاحيات المخصصة للمستخدم");
  }
};
