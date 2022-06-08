<script>
    export default {
        name: "MassShootingTooltipp",
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
        class="mass-shooting-tooltip"
        :style="{
            width: `${width}px`,
        }"
    >
        <div v-if="data?.year">
            <!-- <div>year {{ data.year }}</div>
            <div>mean {{ data.mean }}</div> -->
        </div>
    </div>
</template>

<style lang="scss">
    .mass-shooting-tooltip {
        border: 1px solid;
        padding: 0.35em;
        background: white;
        width: 100%;
        pointer-events: none;
    }
</style>
