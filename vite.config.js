import { defineConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import Pages from "vite-plugin-pages";
import generateSitemap from "vite-plugin-pages-sitemap";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    siteName: "vue-d3-dataviz-starter",
    resolve: {
        alias: [{ find: "@", replacement: "/src" }],
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
                @import "src/styles/animations.scss";
                @import "src/styles/colors.scss";
                @import "src/styles/fonts.scss";
                @import "src/styles/layout.scss";
                `,
            },
        },
    },
    assetsInclude: ["**/*.woff", "**/*.woff2", "**/*.png"],
    filenameHashing: false,
    plugins: [

        vue({
            include: [/\.vue$/, /\.md$/], // <--
        }),
        Components({
            // allow auto load markdown components under `./src/components/`
            extensions: ["vue", "md"],
            // allow auto import and register components used in markdown
            customLoaderMatcher: id => id.endsWith(".md"),
        }),
        Pages({
            extensions: ["vue", "md"],
            dirs: [{ dir: "src/pages", baseRoute: "" }],
            extendRoute(route, parent) {
                console.log(route)
            },

        }),
    ],
    ssgOptions: {
        script: "async",
        formatting: "minify",
        format: "cjs",
    },
});
