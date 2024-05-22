/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: true,
		serverActionsBodySizeLimit: "10mb",
	},
	reactStrictMode: true,
	distDir: "dist",
	webpack(config) {
		config.externals = [...config.externals, "hnswlib-node"];
		return config;
	},
};

module.exports = nextConfig;
