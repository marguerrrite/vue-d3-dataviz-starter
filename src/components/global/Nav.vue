<script>
import { mapState } from "vuex";
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
                <Link to="/" no-decoration class="github-link" alt="vue-d3-dataviz-starter">
                    <StarterTitle />
                </Link>
            </div>
            <div class="right-col">
                <div class="toggle">
                    <Button @click="toggleChartStyle('styled')" :class="{ inactive: chartStyle != 'styled' }"
                        class="toggle-button">
                        <div class="content">Styled <span>Charts</span></div>
                    </Button>
                    <Button @click="toggleChartStyle('unstyled')" :class="{ inactive: chartStyle != 'unstyled' }"
                        class="toggle-button">
                        <div class="content">Unstyled <span>Charts</span></div>
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
    background: var(--grey-100);
    font-weight: 700;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;

    @media(max-width: 500px) {
        box-shadow: 0 2px 50px 0px rgba(black, 0.1);
    }

    .contents {
        display: flex;
        justify-content: space-between;
        align-items: center;

        @media(max-width: 600px) {
            gap: 1em;
            align-items: center;

            .starter-title {
                svg {
                    max-width: 200px;
                    gap: 0em;
                    width: 100%;
                }
            }
        }

        @media(max-width: 420px) {
            gap: 1em;
            align-items: center;

            .starter-title {
                svg {
                    max-width: 160px;
                    gap: 0em;
                    width: 100%;
                }
            }
        }

        .toggle {
            overflow: hidden;
            border-radius: 4px;
            background: white;
            border: 5px solid white;
            display: inline-flex;
            max-width: 306px;
            width: 100%;
            box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
        }

        .toggle-button {
            font-size: 0.85em;
            border-radius: 3px;
            display: inline-flex;
            width: 153px;
            white-space: nowrap;

            @media (max-width: 700px) {
                width: 100%;
                padding: 1em 0.75em;
            }

            @media(max-width: 500px) {
                span {
                    display: none;
                }
            }

            .content {
                width: 100%;
                text-align: center;
            }

            &.inactive {
                background: transparent;
                color: rgba(black, 0.65);
            }
        }
    }
}
</style>
