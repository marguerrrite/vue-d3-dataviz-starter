<script>
import { Head, useHead } from "@vueuse/head";
import { mapState } from "vuex";
export default {
    components: {
        Head,
    },
    props: {},
    data() {
        return {
            loading: false,
        };
    },
    computed: {
        ...mapState({
            mode: state => state.mode
        }),
    },
    methods: {},
    setup() {
        useHead({
            htmlAttrs: { lang: "en", amp: true },
            title: "vue-d3-dataviz-starter | marguerite.io",
            meta: [
                {
                    name: `description`,
                    content: "Dataviz starter for Vue and D3",
                },
                {
                    name: `keywords`,
                    content: ["d3.js", "d3", "data visualization", "data", "javascript",
                        "vue", "vue3", "vite", "scatterplot", "linechart", "graphs",
                        "chart", "global heat", "mass school shooters"]
                },
                {
                    property: `og:title`,
                    content: "vue-d3-dataviz-starter | marguerite.io",
                },
                {
                    property: `og:url`,
                    content: "vue-d3-dataviz-starter | marguerite.io",
                },
                {
                    property: `og:description`,
                    content: "Dataviz starter for Vue and D3",
                },
                {
                    property: `og:image`,
                    content: "./image/og_image.png",
                },
            ],
        });
    },

    mounted() { },
};
</script>

<template>
    <div class="app" theme="light">
        <div id="tooltip-teleport"></div>
        <Layout>
            <router-view :key="$route.path" />
        </Layout>
    </div>
</template>

<style lang="scss">
.app,
#app {
    width: 100%;
    height: 100%;
    background-color: var(--background-color);

    &.navless {
        .sidebar {
            display: none;
        }

        .app-content {
            margin-left: 0;
        }

        .internal-only {
            display: none;
        }
    }

    #tooltip-teleport {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        pointer-events: none;
    }

    .sidebar-header {
        padding-left: 1.25em;

        .WyndlyTitle {
            max-width: 9em;

            &:hover {
                cursor: pointer;
            }
        }
    }

    .hidenav-button {
        margin-top: auto;
    }

    .sidebar-option {
        text-transform: capitalize;
    }

    .app-content {
        margin-left: 14em;
    }

    &[theme="dark"] {
        color: var(--text-base-color);
    }
}
</style>
