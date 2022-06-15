<script>
    import {mapState} from "vuex";
    import GlobalHeatChartUnstyled from "@/components/GlobalHeatChart/unstyled/GlobalHeatChartUnstyled.vue";
    import GlobalHeatChart from "@/components/GlobalHeatChart/styled/GlobalHeatChart.vue";
    import MassShootingPlotUnstyled from "@/components/MassShootingPlot/unstyled/MassShootingPlotUnstyled.vue";
    import MassShootingPlot from "@/components/MassShootingPlot/styled/MassShootingPlot.vue";

    export default {
        name: "Index",
        components: {
            GlobalHeatChartUnstyled,
            GlobalHeatChart,
            MassShootingPlotUnstyled,
            MassShootingPlot,
        },
        data() {
            return {
                isLoaded: false,
                tech: ["Vue 3", "Vite", "D3.js", "CSV", "tooltips", "responsive"],
                titles: {
                    shooting: "Support background checks for all gun owners",
                    heat: ""
                }
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
                <div class="projects" v-if="chartStyle == 'styled'">
                    <div class="project">
                        <label class="unstyled">
                            <strong>Line Chart Styled</strong>
                        </label>
                        <GlobalHeatChart />
                    </div>
                    <div class="project">
                        <label class="unstyled">
                            <strong>Scatter Plot Styled</strong>
                        </label>
                        <MassShootingPlot :title="titles.shooting"/>
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
                <div class="info">

                    <div>
                        <h3>
                        vue-d3-dataviz-starter
                    </h3>
                        <p>
                            Starting projects can be annoying. Here is a Vue + Vite setup
                            with dynamic and interactive D3 examples — line chart, scatter plot.
                        </p>
                        <p>
                            Unstyled and Styled chart components are included.
                        </p>
                    </div>
                </div>
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
                <!-- <p>
                    <ul>
                        <li v-for="item in tech" :key="item">
                            {{item}}
                        </li>
                    </ul>
                </p> -->
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
            justify-content: space-between;
            gap: 4em;

            @media (max-width: 841px) {
                flex-direction: column;
                flex-direction: column-reverse;
                gap: 2em;
            }

            .col-left {
                // max-width: 800px;
                // flex-grow: 1;
            }

            .col-right {
                // width: fit-content;
                // min-width: 200px;
                max-width: 306px;
                @media (max-width: 841px) {
                max-width: 100%;
                display: none;
            }
            }
        }

        .info {
            display: flex;
            font-size: 15px;
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
            margin-bottom: 3em;
            font-size: 0.75em;
        }

        .project {
            margin-bottom: 6em;
        }
    }
</style>
