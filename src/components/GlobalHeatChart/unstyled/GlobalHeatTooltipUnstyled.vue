<script>
    export default {
        name: "GlobalHeatTooltipUnstyled",
        props: {
            data: {
                type: Object,
                required: true,
            },
            width: {
                type: Number,
                default: 400,
            },
        },
        data() {
            return {};
        },
        computed: {},
        methods: {},
        watch: {},
        mounted() {},
    };
</script>

<template>
    <div
        class="global-heat-tooltip-unstyled"
        :style="{
            width: `${width}px`,
        }"
    >
        <div v-if="data?.year">
            <div>year {{ data.year }}</div>
            <div>mean {{ data.mean }}</div>
        </div>
    </div>
</template>

<style lang="scss">
    .global-heat-tooltip-unstyled {
        border: 1px solid;
        padding: 0.35em;
        background: white;
        width: 100%;
        pointer-events: none;
    }
</style>
