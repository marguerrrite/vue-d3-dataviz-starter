<script>
    export default {
        name: "GlobalHeatTooltip",
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
        class="global-heat-tooltip"
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
    .global-heat-tooltip {
        padding: 0.35em;
        background: white;
        width: 100%;
        pointer-events: none;
        background: var(--dusty-rose-200);
        color: var(--plum-700);
        font-size: 0.8em;
    }
</style>
