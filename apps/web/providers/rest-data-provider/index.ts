import axios, { type AxiosInstance } from "axios";
import type { DataProvider } from "@refinedev/core";

const axiosInstance = axios.create();

export const RestDataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance,
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
  getList: async ({ resource, metaData, pagination }) => {
    let url = `${apiUrl}/${resource}?limit=${pagination?.pageSize || 10}`;

    if (metaData?.cursor?.next) {
      url = `${url}&next=${metaData.cursor.next}`;
    } else if (metaData?.cursor?.prev) {
      url = `${url}&prev=${metaData.cursor.prev}`;
    }

    const { data } = await httpClient.get(url);

    return {
      data: data.data, // Extract the actual data array
      total: 200, // Total count is not available in the API
      cursor: {
        next: data.meta?.next, // Return the next cursor
        prev: data.meta?.prev, // Return the previous cursor
      },
    };
  },

  getMany: async () => {
    throw new Error("Not implemented");
  },

  create: async () => {
    throw new Error("Not implemented");
  },

  update: async () => {
    throw new Error("Not implemented");
  },

  getOne: async () => {
    throw new Error("Not implemented");
  },

  deleteOne: async () => {
    throw new Error("Not implemented");
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async () => {
    throw new Error("Not implemented");
  },
});