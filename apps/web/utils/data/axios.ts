import type { HttpError } from "@refinedev/core";
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const customError: HttpError = {
			...error,
			message: error.response?.data?.message,
			statusCode: error.response?.status,
		};

		if (customError.statusCode === 401 || customError.statusCode === 403) {
			Cookies.remove("accessToken");
			Cookies.remove("refreshToken");

			window.location.href = "/";
			// window.location.href = "/login";
		}

		return Promise.reject(customError);
	}
);

export { axiosInstance };
