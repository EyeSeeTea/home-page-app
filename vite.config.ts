/// <reference types="vitest" />
import { UserConfig, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import nodePolyfills from "vite-plugin-node-stdlib-browser";
import * as path from "path";

const redirectPaths = ["/dhis-web-pivot", "/dhis-web-data-visualizer", "/dhis-web-commons-ajax-json"];

function createProxyConfig(targetUrl: string, auth: string) {
    const target = targetUrl.replace(/\/$/, "");
    return {
        target: targetUrl,
        changeOrigin: true,
        auth: auth,
        configure: (proxy: import("http-proxy").Server) => {
            proxy.on("proxyReq", (proxyReq, req, res) => {
                const pathname = (proxyReq as any).path || req.url || "";
                const shouldRedirect = redirectPaths.some(p => pathname.startsWith(p));
                if (shouldRedirect) {
                    const redirectUrl = target + pathname;
                    res.writeHead(302, { Location: redirectUrl });
                    res.end();
                    proxyReq.destroy();
                }
            });
        },
    };
}

export default ({ mode }: { mode: string }): UserConfig => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    const proxy = getProxy(env);

    return defineConfig({
        base: "",
        plugins: [
            nodePolyfills(),
            react(),
            checker({
                overlay: false,
                typescript: true,
                eslint: {
                    lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
                    dev: { logLevel: ["warning"] },
                },
            }),
        ],
        test: {
            environment: "jsdom",
            include: ["**/*.spec.{ts,tsx}"],
            setupFiles: "./src/tests/setup.ts",
            exclude: ["node_modules"],
            globals: true,
        },
        server: {
            port: parseInt(env.VITE_PORT || "3000", 10),
            proxy,
        },
        resolve: {
            alias: {
                $: path.resolve(__dirname, "./src"),
            },
        },
    });
};

function getProxy(env: Record<string, string>) {
    const dhis2UrlVar = "VITE_DHIS2_BASE_URL";
    const dhis2AuthVar = "VITE_DHIS2_AUTH";
    const targetUrl = env[dhis2UrlVar];
    const auth = env[dhis2AuthVar] || "";
    const isBuild = env.NODE_ENV === "production";

    if (isBuild) {
        return {};
    }
    if (!targetUrl) {
        console.error(`Set ${dhis2UrlVar} to base DHIS2 URL`);
        process.exit(1);
    }
    if (!auth) {
        console.error(`Set ${dhis2AuthVar}`);
        process.exit(1);
    }

    const proxyConfig = createProxyConfig(targetUrl, auth);

    return {
        "/dhis2": {
            ...proxyConfig,
            rewrite: (pathSegment: string) => pathSegment.replace(/^\/dhis2/, ""),
        },
        "/documents": {
            ...proxyConfig,
            rewrite: (pathSegment: string) => pathSegment.replace(/^\/documents/, "/api/documents"),
        },
        "/api": {
            ...proxyConfig,
        },
    };
}
