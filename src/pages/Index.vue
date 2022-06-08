<script>
    import {mapState} from "vuex";
    import GlobalHeatChartUnstyled from "@/components/GlobalHeatChart/unstyled/GlobalHeatChartUnstyled.vue";
    import MassShootingPlotUnstyled from "@/components/MassShootingPlot/unstyled/MassShootingPlotUnstyled.vue";

    export default {
        name: "Index",
        components: {
            GlobalHeatChartUnstyled,
            MassShootingPlotUnstyled,
        },
        data() {
            return {
                isLoaded: false,
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
        <div>
            <p>
                Starting projects can be annoying. Here is a Vue + Vite setup with some
                dynamic and interactive D3 examples!
            </p>
        </div>
        <div class="projects" v-if="chartStyle == 'styled'">
            <div class="project">
                TBD
            </div>
            <div class="project">
                TBD
            </div>
        </div>
        <div class="projects" v-if="chartStyle == 'unstyled'">
            <div class="project">
                <MassShootingPlotUnstyled />
            </div>
            <div class="project">
                <GlobalHeatChartUnstyled />
            </div>
        </div>
    </MaxWidth>
</template>

<style lang="scss" >
    @import "./../styles/globals";
    .Index {
        height: 100%;
        padding-top: 1em;

        .projects {
        }

        .project {
            margin: 3em 0;
        }
    }
</style>
