<script>
    import {mapState} from "vuex";
    import GlobalHeatChartUnstyled from "@/components/GlobalHeatChart/unstyled/GlobalHeatChartUnstyled.vue";
    import MassShootingPlotUnstyled from "@/components/MassShootingPlot/unstyled/MassShootingPlotUnstyled.vue";
    import MassShootingPlot from "@/components/MassShootingPlot/styled/MassShootingPlot.vue";

    export default {
        name: "Index",
        components: {
            GlobalHeatChartUnstyled,
            MassShootingPlotUnstyled,
            MassShootingPlot,
        },
        data() {
            return {
                isLoaded: false,
                tech: ["Vue 3", "Vite", "D3.js", "CSV"],
            };
        },
        computed: {
            ...mapState({
                chartStyle: state => state.chartStyle,
            }),
        },

        methods: {},
        mounted() {
            this.isLoaded = true;
        },
    };
</script>

<template>
    <MaxWidth class="Index" size="m" v-if="isLoaded">
        <div class="page-content">
            <div class="col-left">
                <div class="info">
                    <div>
                        <p>
                            Starting projects can be annoying. Here is a Vue + Vite setup
                            with some dynamic and interactive D3 examples! Aka D3
                            Stickies.
                        </p>

                    </div>
                </div>
                <div class="projects" v-if="chartStyle == 'styled'">
                    <div class="project">
                        <label class="unstyled">
                            <strong>Scatter Plot Styled</strong>
                        </label>
                        <MassShootingPlot />
                    </div>
                    <div class="project">
                        <label class="unstyled">
                            <strong>Line Chart Styled</strong>
                        </label>
                        TBD
                    </div>
                </div>
                <div class="projects" v-if="chartStyle == 'unstyled'">
                    <div class="project">
                        <label class="unstyled">
                            <strong>Scatter Plot Unstyled</strong> 25 & Under US Mass Shooters
                        </label>
                        <MassShootingPlotUnstyled />
                    </div>
                    <div class="project">
                        <label class="unstyled">
                            <strong> Line Chart Unstyled</strong> 25 & Under US Mass Shooters
                        </label>
                        <GlobalHeatChartUnstyled />
                    </div>
                </div>
            </div>
            <div class="col-right">
                <p>
                    <Link
                        to="https://github.com/margueriteroth/vue-d3-dataviz-starter"
                        do-open-in-new-tab
                        is-button
                        class="github-link"
                    >
                        Github repo
                    </Link>
                </p>
                <p>
                    <ul>
                        <li v-for="item in tech" :key="item">
                            {{item}}
                        </li>
                    </ul>
                </p>
            </div>
        </div>
    </MaxWidth>
</template>

<style lang="scss" >
    @import "./../styles/globals";
    .Index {
        height: 100%;
        padding-top: 1em;
        margin-top: 5em;

        .page-content {
            display: flex;
            gap: 4em;

            @media(max-width: 600px) {
                flex-direction: column;
            }

            .col-left {
                max-width: 800px;
            }

            .col-left {
                width: 100%;
            }
        }

        .info {
            display: flex;
        }

        .github-link {
            font-weight: 700;
        }

        .projects {
        }

        .unstyled {
            font-family: monospace;
            background: var(--grey-200);
            padding: 0.25em;
            color: var(--grey-700);
            display: inline-block;
            margin-bottom: 0.25em;
        }

        .project {
            margin: 3em 0;
        }
    }
</style>
