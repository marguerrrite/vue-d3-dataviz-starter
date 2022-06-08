<script>
    export default {
        name: "MassShootingTooltipUnstyled",
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
        class="mass-shooting-tooltip-unstyled"
        :style="{
            width: `${width}px`,
        }"
    >
        <div v-if="data?.year">
            <div>{{ data.shooter_name }}, {{ data.age_of_shooter }}</div>
            <div>{{ data.location }},{{ data.date }}</div>
        </div>
    </div>
</template>

<style lang="scss">
    .mass-shooting-tooltip-unstyled {
        border: 1px solid;
        padding: 0.35em;
        background: white;
        width: 100%;
        pointer-events: none;
    }
</style>
