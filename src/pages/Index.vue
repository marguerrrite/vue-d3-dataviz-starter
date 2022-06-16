<script>
import { mapState } from "vuex";
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
            tech: ["Vue 3", "Vite", "D3", "CSV imports", "Coordinate tooltips",
                "Voronoi tooltips", "Responsive layouts", "Color scales & interpolation", "100% Lighthouse accessible"],
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
                <!-- <p v-for="index in 7" :key="index">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Nisl purus in mollis nunc sed id semper risus. Dui sapien eget mi proin. At
                    erat pellentesque adipiscing commodo. Vitae auctor eu augue ut lectus arcu bibendum at. Sit amet
                    mauris commodo quis. Faucibus et molestie ac feugiat sed. Non nisi est sit amet facilisis magna
                    etiam tempor. Fames ac turpis egestas sed. A erat nam at lectus urna. Aliquet eget sit amet tellus
                    cras. Purus semper eget duis at tellus at. Scelerisque mauris pellentesque pulvinar pellentesque
                    habitant morbi tristique senectus. Consectetur lorem donec massa sapien. Eget nulla facilisi etiam
                    dignissim diam quis. Sit amet justo donec enim diam. Amet aliquam id diam maecenas ultricies mi eget
                    mauris pharetra. Dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in. Interdum
                    velit laoreet id donec ultrices tincidunt arcu.
                </p> -->
                <div class="projects" v-if="chartStyle == 'styled'">
                    <div class="project">
                        <div>Bees</div>
                        <MassShootingPlot :title="titles.shooting" />
                    </div>
                    <div class="project">
                        <!-- <GlobalHeatChart /> -->
                    </div>
                </div>
                <div class="projects" v-if="chartStyle == 'unstyled'">
                    <div class="project">
                        <MassShootingPlotUnstyled />
                    </div>
                    <div class="project">
                        <!-- <GlobalHeatChartUnstyled /> -->
                    </div>
                </div>
            </div>
            <div class="col-right">
                <div class="col-right-fixed">
                    <div class="info">
                        <div>
                            <h3>
                                <Link to="https://github.com/margueriteroth/vue-d3-dataviz-starter" do-open-in-new-tab
                                    class="github-link">
                                vue-d3-dataviz-starter
                                </Link>
                            </h3>
                            <p>
                                Here is a Vue + Vite setup with dynamic and interactive D3 examples — as of now, a line
                                chart
                                and scatter plot. 😊
                            </p>
                            <p>
                                <strong>Styled</strong> and
                                <strong>Unstyled</strong> chart components are included in this
                                repo.
                            </p>
                        </div>
                    </div>
                    <p>
                        <Link to="https://github.com/margueriteroth/vue-d3-dataviz-starter" do-open-in-new-tab is-button
                            class="github-link">
                        Github repo <span class="font-inter">-></span>
                        </Link>
                    </p>
                    <ul>

                        <li v-for="item in tech" :key="item">
                            {{ item }}
                        </li>
                    </ul>
                    <label class="label">
                        Last updated June 19, 2022.
                    </label>
                </div>
            </div>
        </div>
    </MaxWidth>
</template>

<style lang="scss" >
@import "./../styles/globals";

.Index {
    height: 100%;
    padding-top: 8em;

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
            flex: 1;
            max-width: 800px;
        }

        .col-right {
            // width: fit-content;
            // min-width: 200px;
            max-width: 306px;
            position: relative;
            width: 66em;

            @media (max-width: 841px) {
                max-width: 100%;
            }

            .col-right-fixed {
                position: fixed;
                top: 7.5em;
                padding-right: 2rem;

                @media(min-width: 1400px) {
                    margin-right: calc((100% - 1400px) / 2);
                }

                margin-right: 0;

                @media (max-width: 841px) {
                    position: initial;
                }
            }

            ul {
                list-style: none;
                padding-left: 1.25em;
            }

            li:before {
                content: "+";
                margin-right: 0.75em;
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

    .projects {}

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
        flex: 1;
    }
}
</style>
