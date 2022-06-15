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
                <Link to="https://github.com/margueriteroth/vue-d3-dataviz-starter" do-open-in-new-tab no-decoration
                    class="github-link">
                    <StarterTitle/>
                </Link>
            </div>
            <div class="right-col">
                <div class="toggle">

                    <Button @click="toggleChartStyle('styled')" :class="{ inactive: chartStyle != 'styled' }"
                        class="toggle-button">
                        <div class="content">Styled Charts</div>
                    </Button>
                    <Button @click="toggleChartStyle('unstyled')" :class="{ inactive: chartStyle != 'unstyled' }"
                        class="toggle-button">
                        <div class="content">Unstyled Charts</div>
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
    //background: var(--grey-200);
    font-weight: 700;
    //position: fixed;
    top: 0;
    left: 0;

    .contents {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .toggle {
            overflow: hidden;
            border-radius: 4px;
            background: var(--grey-800);
            border: 3px solid var(--grey-800);
            display: inline-flex;
            max-width: 306px;
            width: 100%;
        }

        .toggle-button {
            font-size: 0.85em;
            background: rgba(white, 0.85);
            border-radius: 3px;
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
                color: rgba(white, 0.5);
            }
        }
    }
}
</style>
