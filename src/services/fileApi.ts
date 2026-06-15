import { api } from "./api";
import { endpoints } from "./endpoints";
import type { ApiEnvelope } from "./types";

export type FileUploadResponse = {
  id: string;
  url: string;
  contentType: string;
  sizeBytes: number;
};

export const fileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<FileUploadResponse, FormData>({
      query: (formData) => ({
        url: endpoints.fileUpload,
        method: "POST",
        body: formData,
        // Fetch/RTK Query will automatically set the correct Content-Type with boundary
        // when body is FormData. We DO NOT set 'Content-Type': 'multipart/form-data' manually.
      }),
      transformResponse: (res: ApiEnvelope<FileUploadResponse>) => res.data,
    }),
    uploadFilesBatch: builder.mutation<FileUploadResponse[], FormData>({
      query: (formData) => ({
        url: endpoints.fileUploadBatch,
        method: "POST",
        body: formData,
      }),
      transformResponse: (res: ApiEnvelope<FileUploadResponse[]>) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const { useUploadFileMutation, useUploadFilesBatchMutation } = fileApi;
