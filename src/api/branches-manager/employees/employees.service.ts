import { TPaginationResponse, TSingleResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { TBranchEmployee, TListItem } from "./employees.types";
import { populateError } from "@/api/api.utils";

export const getEmployees = async (page: number) => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<TBranchEmployee> }>(
            `/branch_managers/employees/get_employees`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الموظفين");
    }
};

export const getSingleEmployee = async (id: string | undefined) => {
    try {
        const { data } = await api.get<TSingleResponse<TBranchEmployee>>(
            `/branch_managers/employees/get_employee/${id}`
        );
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الموظفين");
    }
};

export const createEmployee = async (data: FormData) => {
    try {
        await api.post(`/branch_managers/employees/create_employee`, data);
    } catch (error) {
        populateError(error, "خطأ فى إضافة الموظف");
    }
};

export const updateEmployee = async (id: string, data: FormData) => {
    try {
        await api.post(`/branch_managers/employees/update_employees/${id}`, data);
    } catch (error) {
        populateError(error, "خطأ فى تعديل الموظف");
    }
};

export const deleteEmployee = async (id: string) => {
    try {
        await api.delete(`/branch_managers/employees/delete_employee/${id}`);
    } catch (error) {
        populateError(error, "خطأ فى حذف الموظف");
    }
};

export const blockEmployee = async (id: string) => {
    try {
        await api.post(`/branch_managers/employees/block_employees/${id}`);
    } catch (error) {
        populateError(error, "خطأ في حظر الموظف");
    }
};

export const getDeletedEmployees = async (page: number) => {
    try {
        const { data } = await api.get<{
            data: TPaginationResponse<TBranchEmployee>;
        }>(`/branch_managers/employees/get_deleted_employees`, {
            params: { page: page },
        });
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ في جلب الموظفين المحذوفين");
    }
};

export const restoreDeletedEmployee = async (id: string) => {
    try {
        await api.get(`/branch_managers/employees/restore_employees/${id}`);
    } catch (error) {
        populateError(error, "خطأ في استعادة الموظف المحذوف");
    }
};

export const forceDeleteEmployee = async (id: string) => {
    try {
        await api.delete(`/branch_managers/employees/force_delete_employees/${id}`);
    } catch (error) {
        populateError(error, "خطأ في حذف الموظف");
    }
};

export const getListByModule = async (switchKey: string, id: string | number | undefined) => {
    let endpoint = "/branch_managers/employees/get_branches"
    switch (switchKey) {
        case "branches-list": endpoint = "/branch_managers/employees/get_branches"
            break;

        case "department-list": endpoint = `/branch_managers/employees/get_branches_department/${id}`
            break;

        case "job-list": endpoint = `/branch_managers/employees/get_branches_job/${id}`
            break;

        case "roles-list": endpoint = `/branch_managers/employees/get_role_branch/${id}`
            break;

        case "branch-employee-department-list": endpoint = `/branches/employees/get_my_branches_department`
            break;

        case "branch-employee-job-list": endpoint = `/branches/employees/get_my_branches_job/${id}`
            break;

        case "branch-employee-roles-list": endpoint = `/branches/employees/get_my_role_branch`
            break;

        case "branch-job-department-list": endpoint = `/branches/jobs/get_department`
            break;

        case "branch-sub-category-list": endpoint = `/branches/sub_categories/get_my_categories`
            break;

        case "order-categories-list": endpoint = `/branches/orders/get_categories`
            break;

        case "order-sub-categories-list": endpoint = `/branches/orders/sub-categories/${id}`
            break;

        case "employees-inventories-categories-list": endpoint = `/employees/inventories/ge_category`
            break;

        case "employees-inventories-sub-categories-list": endpoint = `/employees/inventories/get_sub_category_by_categories/${id}`
            break;

        case "employees-inventories-transfer-branches-list": endpoint = `/employees/inventories/get_branches`
            break;

        case "employees-order-categories-list": endpoint = `/employees/orders/categories`
            break;

        case "employees-order-sub-categories-list": endpoint = `/employees/orders/sub-categories/${id}`
            break;

        default: endpoint = "/branch_managers/employees/get_branches"
    }

    try {
        const { data } = await api.get<{ data: TListItem[] }>(
            endpoint,
        );
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب البيانات");
    }
};