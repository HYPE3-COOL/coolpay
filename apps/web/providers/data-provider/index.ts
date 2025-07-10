"use client";

import { ApiDataProvider } from "@/utils/data/ApiDataProvider";
import { RestDataProvider } from "@/providers/rest-data-provider";
// import dataProviderSimpleRest from "@refinedev/simple-rest";
// const API_URL = "https://api.fake-rest.refine.dev";
const API_URL = process.env.NEXT_PUBLIC_API_URL!;
// const API_URL = process.env.NEXT_PUBLIC_API_HOST!;

// export const dataProvider = dataProviderSimpleRest(API_URL);
export const dataProvider = ApiDataProvider(API_URL)
// export const dataProvider = RestDataProvider('https://coolpaybot-dev.vercel.app/api/v1');
