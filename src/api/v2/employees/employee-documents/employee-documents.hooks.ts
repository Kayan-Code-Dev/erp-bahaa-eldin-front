import {
  createEmployeeDocument,
  deleteEmployeeDocument,
  downloadEmployeeDocument,
  getAllEmployeesDocuments,
  getEmployeeDocument,
  getEmployeeDocumentTypes,
  getExpiredEmployeeDocuments,
  getExpiringSoonEmployeeDocumentsyDays,
  unverifyEmployeeDocument,
  updateEmployeeDocument,
  verifyEmployeeDocument,
} from "./employee-documents.service";
import {
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  TGetAllEmployeesDocumentsParams,
  TUpdateEmployeeDocumentRequest,
} from "./employee-documents.types";

export const EMPLOYEE_DOCUMENTS_KEY = "EMPLOYEE_DOCUMENTS_KEY";

export const useCreateEmployeeDocumentMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: createEmployeeDocument,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DOCUMENTS_KEY] });
    },
  });
};

export const useUpdateEmployeeDocumentMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: ({
      document_id,
      data,
    }: {
      document_id: number;
      data: TUpdateEmployeeDocumentRequest;
    }) => updateEmployeeDocument(document_id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DOCUMENTS_KEY] });
    },
  });
};

export const useDeleteEmployeeDocumentMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: ({ document_id }: { document_id: number }) =>
      deleteEmployeeDocument(document_id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DOCUMENTS_KEY] });
    },
  });
};

export const useGetEmployeeDocumentQueryOptions = (document_id: number) => {
  return queryOptions({
    queryKey: [EMPLOYEE_DOCUMENTS_KEY, document_id],
    queryFn: () => getEmployeeDocument(document_id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetAllEmployeesDocumentsQueryOptions = (
  params: TGetAllEmployeesDocumentsParams
) => {
  return queryOptions({
    queryKey: [EMPLOYEE_DOCUMENTS_KEY, params],
    queryFn: () => getAllEmployeesDocuments(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useVerifyEmployeeDocumentMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: ({ document_id }: { document_id: number }) =>
      verifyEmployeeDocument(document_id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DOCUMENTS_KEY] });
    },
  });
};

export const useUnverifyEmployeeDocumentMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: ({ document_id }: { document_id: number }) =>
      unverifyEmployeeDocument(document_id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DOCUMENTS_KEY] });
    },
  });
};

export const useDownloadEmployeeDocumentQueryOptions = (
  document_id: number
) => {
  return queryOptions({
    queryKey: [EMPLOYEE_DOCUMENTS_KEY, document_id, "download"],
    queryFn: () => downloadEmployeeDocument(document_id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetEmployeeDocumentTypesQueryOptions = () => {
  return queryOptions({
    queryKey: [EMPLOYEE_DOCUMENTS_KEY, "types"],
    queryFn: () => getEmployeeDocumentTypes(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetExpiringSoonEmployeeDocumentsQueryOptions = (
  page: number,
  per_page: number,
  days: number
) => {
  return queryOptions({
    queryKey: [EMPLOYEE_DOCUMENTS_KEY, "expiring", page, per_page, days],
    queryFn: () => getExpiringSoonEmployeeDocumentsyDays(page, per_page, days),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetExpiredEmployeeDocumentsQueryOptions = (
  page: number,
  per_page: number
) => {
  return queryOptions({
    queryKey: [EMPLOYEE_DOCUMENTS_KEY, "expired", page, per_page],
    queryFn: () => getExpiredEmployeeDocuments(page, per_page),
    staleTime: 1000 * 60 * 5,
  });
};
