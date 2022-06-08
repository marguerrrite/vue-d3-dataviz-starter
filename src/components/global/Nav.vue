<script>
    import {mapState} from "vuex";
    export default {
        name: "Nav",
        components: {},
        props: {},
        data() {
            return {};
        },
        computed: {
            ...mapState({
                chartStyle: state => state.chartStyle,
            }),
        },
        methods: {
            toggleChartStyle(style) {
                this.$store.dispatch("setChartStyle", style);
            },
        },
    };
</script>

<template>
    <MaxWidth size="xl" class="nav">
        <MaxWidth size="m" class="contents">
            <div class="left-col">vue-d3-dataviz-starter</div>
            <div class="right-col">
                <div class="toggle">
                    <Button
                        @click="toggleChartStyle('unstyled')"
                        :class="{inactive: chartStyle != 'unstyled'}"
                        class="toggle-button"
                    >
                        Bare Charts
                    </Button>
                    <Button
                        @click="toggleChartStyle('styled')"
                        :class="{inactive: chartStyle != 'styled'}"
                        class="toggle-button"
                    >
                        Styled Charts
                    </Button>
                </div>
            </div>
        </MaxWidth>
    </MaxWidth>
</template>

<style lang="scss">
    .nav {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-weight: 600;
        transition: all 100ms linear;
        padding-top: 1em;
        padding-bottom: 1em;
        background: var(--red-orange-500);
        color: white;
        font-weight: 700;

        .contents {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .toggle {
                overflow: hidden;
                border-radius: 4px;
                background: var(--red-orange-700);
                border: 4px solid var(--red-orange-700);
                display: inline-flex;
            }

            .toggle-button {
                font-size: 0.85em;
                background: rgba(black, 0.2);
                border-radius: 3px;
                color: white;
                display: inline-flex;
                width: fit-content;

                &.inactive {
                    background: transparent;
                    color: var(--red-orange-800);
                }
            }
        }
    }
</style>
