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
            <div class="left-col">
                <Link
                    to="https://github.com/margueriteroth/vue-d3-dataviz-starter"
                    do-open-in-new-tab
                    no-decoration
                    class="github-link"
                >
                    vue-d3-dataviz-starter
                </Link>
            </div>
            <div class="right-col">
                <div class="toggle">
                    <Button
                        @click="toggleChartStyle('unstyled')"
                        :class="{inactive: chartStyle != 'unstyled'}"
                        class="toggle-button"
                    >
                        <div class="content">Unstyled Charts</div>
                    </Button>
                    <Button
                        @click="toggleChartStyle('styled')"
                        :class="{inactive: chartStyle != 'styled'}"
                        class="toggle-button"
                    >
                        <div class="content">Styled Charts</div>
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
        background: white;
        //color: white;
        font-weight: 700;
        position: fixed;
        top: 0;
        left: 0;

        .contents {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .toggle {
                overflow: hidden;
                border-radius: 4px;
                background: var(--red-orange-700);
                border: 4px solid var(--red-orange-700);

                background: var(--neon-green-300);
                border: 4px solid var(--neon-green-300);
                display: inline-flex;
                max-width: 306px;
                width: 100%;
            }

            .toggle-button {
                font-size: 0.85em;
                background: rgba(black, 0.35);
                border-radius: 3px;
                color: white;
                display: inline-flex;
                width: 153px;
                white-space: nowrap;

                @media (max-width: 700px) {
                    width: 100%;
                }

                .content {
                    width: 100%;
                    text-align: center;
                }

                &.inactive {
                    background: transparent;
                    color: var(--red-orange-900);
                }
            }
        }
    }
</style>
