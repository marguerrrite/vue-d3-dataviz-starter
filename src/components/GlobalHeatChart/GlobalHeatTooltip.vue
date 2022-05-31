<script>
    import utils from "@/scripts/utils.js";

    import {
        scaleLinear,
        scaleBand,
        curveCardinal,
        scaleUtc,
        range,
        line,
        sum,
        max,
        min,
        timeFormat,
        timeSeconds,
        utcMinute,
        utcHour,
    } from "d3";

    export default {
        name: "GlobalHeatTooltip",
        props: {

        },
        data() {
            return {

            };
        },
        computed: {

        },
        methods: {

        },
        watch: {

        },
        mounted() {
        },
    };
</script>

<template>
    <div class="global-heat-tooltip">
        tooltip
    </div>
</template>

<style lang="scss">
    .global-heat-tooltip {
        width: min-width;
        border: 1px solid;
        padding: 0.35em;
        background: white;
        pointer-events: none;
    }
</style>
