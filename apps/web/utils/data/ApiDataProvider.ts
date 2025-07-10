import type { AxiosInstance } from "axios";
import queryString from "query-string";
import type { DataProvider } from "@refinedev/core";
// import { axiosInstance } from "./axios";
// import { generateSort } from "./generateSort";
import Cookies from "js-cookie";
import { axiosInstance } from "./axios";

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

const getHeaders = (metaHeaders?: Record<string, string>) => {
	const accessToken = Cookies.get("accessToken");
	return {
		...metaHeaders,
		...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
	};
};

export const ApiDataProvider = (
	apiUrl: string,
	httpClient: AxiosInstance = axiosInstance
): Omit<Required<DataProvider>, "createMany" | "updateMany" | "deleteMany"> => ({
	getList: async ({ resource, pagination, filters, sorters, meta }) => {
		const url = `${apiUrl}/${resource}`;

		const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};
		const requestMethod = (meta?.method as MethodTypes) ?? "get";

		const query: { [key: string]: any } = {
			pageSize,
			current
		};

		// const generatedSort = generateSort(sorters);
		// if (generatedSort) {
		// 	const { sortBy } = generatedSort;
		// 	query.sortBy = sortBy.join(",");
		// }

		const buildUrl = (baseUrl: string, params: any) => {
			const queryParts = [];

			queryParts.push(`pageSize=${params.pageSize}`);
			queryParts.push(`page=${params.current}`);

			// if (filters && filters.length > 0) {
			// 	filters.forEach((filter, index) => {
			// 		if ("field" in filter) {
			// 			queryParts.push(`filters[${index}][field]=${filter.field}`);
			// 			queryParts.push(`filters[${index}][operator]=${filter.operator}`);
			// 			queryParts.push(`filters[${index}][value]=${encodeURIComponent(filter.value)}`);
			// 		}
			// 	});
			// }

			// if (params.sortBy) {
			// 	queryParts.push(`sortBy=${params.sortBy}`);
			// }

			return `${baseUrl}?${queryParts.join('&')}`;
		};

		const urlWithQuery = buildUrl(url, query);

		let { data, headers } = await httpClient[requestMethod](urlWithQuery, {
			headers: getHeaders(meta?.headers),
		});

		const total = +headers["x-total-count"];

		if (resource.includes('options')) {
			data = data.data;
		}

		return { data, total: total || data.length };
	},

	getMany: async ({ resource, ids, meta }) => {
		const requestMethod = (meta?.method as MethodTypes) ?? "get";
		const { data } = await httpClient[requestMethod](`${apiUrl}/${resource}?${queryString.stringify({ id: ids })}`, {
			headers: getHeaders(meta?.headers),
		});
		return { data };
	},

	create: async ({ resource, variables, meta }) => {
		const url = `${apiUrl}/${resource}`;
		const requestMethod = (meta?.method as MethodTypesWithBody) ?? "post";

		const { data } = await httpClient[requestMethod](url, variables, {
			headers: getHeaders(meta?.headers),
		});

		return { data };
	},

	update: async ({ resource, id, variables, meta }) => {
		const url = `${apiUrl}/${resource}/${id}`;
		const requestMethod = (meta?.method as MethodTypesWithBody) ?? "patch";

		const { data } = await httpClient[requestMethod](url, variables, {
			headers: getHeaders(meta?.headers),
		});

		return { data };
	},

	getOne: async ({ resource, id, meta }) => {
		const url = `${apiUrl}/${resource}/${id}`;
		const requestMethod = (meta?.method as MethodTypes) ?? "get";

		const { data } = await httpClient[requestMethod](url, {
			headers: getHeaders(meta?.headers),
		});

		const _data = data.data;

		return { data: _data };
	},

	deleteOne: async ({ resource, id, variables, meta }) => {
		const url = `${apiUrl}/${resource}/${id}`;
		const requestMethod = (meta?.method as MethodTypesWithBody) ?? "delete";

		const { data } = await httpClient[requestMethod](url, {
			data: variables,
			headers: getHeaders(meta?.headers),
		});

		return { data };
	},

	getApiUrl: () => apiUrl,

	custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
		let requestUrl = `${url}?`;

		// if (sorters) {
		// 	const generatedSort = generateSort(sorters);
		// 	if (generatedSort) {
		// 		const { sortBy } = generatedSort;
		// 		const sortQuery = {
		// 			sortBy: sortBy.join(","),
		// 		};
		// 		requestUrl = `${requestUrl}&${queryString.stringify(sortQuery)}`;
		// 	}
		// }

		// if (filters) {
		// 	const filterQuery = generateFilter(filters);
		// 	requestUrl = `${requestUrl}&${queryString.stringify(filterQuery)}`;
		// }

		if (query) {
			requestUrl = `${requestUrl}&${queryString.stringify(query)}`;
			console.log({ requestUrl });
		}

		let axiosResponse;
		switch (method) {
			case "put":
			case "post":
			case "patch":
				axiosResponse = await httpClient[method](url, payload, {
					headers: getHeaders(headers),
				});
				break;
			case "delete":
				axiosResponse = await httpClient.delete(url, {
					data: payload,
					headers: getHeaders(headers),
				});
				break;
			default:
				axiosResponse = await httpClient.get(requestUrl, {
					headers: getHeaders(headers),
				});
				break;
		}

		const { data } = axiosResponse;

		return Promise.resolve({ data });
	},
});
