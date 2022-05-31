<script>
    import {mapState} from "vuex";
    import GlobalHeatChart from "@/components/GlobalHeatChart.vue";

    export default {
        name: "Index",
        components: {
            GlobalHeatChart
        },
        data() {
            return {
                isLoaded: false,
            };
        },
        computed: {
            ...mapState({
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
                Starting projects is annoying. Here is a Vue + Vite setup with some D3 examples!
            </p>
        </div>
        <GlobalHeatChart/>
    </MaxWidth>
</template>

<style lang="scss" >
    @import "./../styles/globals";
    .Index {
        height: 100%;
    }
</style>
