// import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));


/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@refinedev/antd"],
  output: "standalone",
  // webpack(config) {
  //   config.resolve.alias['@'] = path.resolve(__dirname);
  //   return config;
  // }
};

export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     transpilePackages: ["@refinedev/antd"],
//     output: "standalone",
//   };
  
//   export default nextConfig;
  