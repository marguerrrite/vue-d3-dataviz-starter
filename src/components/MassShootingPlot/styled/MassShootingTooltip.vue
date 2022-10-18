<script>
    import {interpolateCool, timeFormat} from "d3";
    export default {
        name: "MassShootingTooltip",
        props: {
            data: {
                type: Object,
                required: true,
            },
            width: {
                type: Number,
                default: 400,
            },
            height: {
                type: Number,
                default: 100,
            },
            maxVictimData: {
                type: Object,
                required: true,
            },
            noPointerEvents: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {
                priorColor: interpolateCool(0.8),
            };
        },
        computed: {
            humanDate() {
                let dateFormat = "%b %d, %Y";
                return timeFormat(dateFormat)(this.data.date);
            },
            isUnder30() {
                return parseInt(this.data.age_of_shooter) <= 30;
            },
            didShowPriorSigns() {
                let value = this.data.prior_signs_mental_health_issues;
                if (value.toLowerCase() == "yes") {
                    return true;
                }
                return false;
            },
            obtainedWeaponsLegally() {
                if (this.data.weapons_obtained_legally.toLowerCase() == "yes") {
                    return 1;
                } else if (
                    this.data.weapons_obtained_legally.toLowerCase() == "no"
                ) {
                    return 0;
                } else {
                    return -1;
                }
            },
            sources() {
                return [...this.data.sources.split(";")];
            },
            names() {
                let names = this.data.shooter_name.split(", ");
                return names;
            },
        },
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
            height: `${height}px`,
            'pointer-events': `${noPointerEvents ? 'none' : 'auto'}`,
        }"
    >
        <div v-if="data?.year" class="content">
            <div class="top">
                <div class="names">
                    <div class="name" v-for="name in names" :key="name">
                        <div class="icon icon-name"></div>
                        {{ name }}
                        <span class="age"
                            >({{
                                name.includes("Eric Harris")
                                    ? 18
                                    : data.age_of_shooter
                            }})</span
                        >
                    </div>
                </div>
                <div class="tags">
                    <div class="tag prior-signs" v-if="didShowPriorSigns">
                        <div class="icon icon-warning"></div>
                        Displayed violent warning signs
                    </div>
                </div>
            </div>
            <div class="data">
                <div class="fact">
                    <div class="number">
                        {{ data.total_victims }}
                    </div>
                    <div class="label">
                        Fatalities
                    </div>
                </div>
                <div class="fact">
                    <div class="number">
                        {{ data.total_victims }}
                    </div>
                    <div class="label">
                        Total victims
                    </div>
                </div>
            </div>
            <div class="summary">
                <div class="summary-clamp">
                    <div class="title">
                        {{ data.case }}
                    </div>
                    <p class="">{{ data.summary }}</p>
                </div>

                <div class="sources">
                    <Link to="https://github.com/margueriteroth/vue-d3-dataviz-starter/blob/main/public/data/mass-shooting-mother-jones.csv" do-open-in-new-tab class="source"
                        >CSV</Link
                    >
                    <Link :to="sources[0]" do-open-in-new-tab class="source"
                        >Source</Link
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .mass-shooting-tooltip {
        --tooltip-padding: 0.7rem 0.9rem;
        --tooltip-rule: 1px solid var(--grey-300);

        background: white;
        width: 100%;
        font-size: 0.85em;
        border-radius: 3px;
        box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px,
            rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px,
            rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px,
            rgba(0, 0, 0, 0.07) 0px 32px 64px;
        min-height: 1em;
        z-index: 200;
        height: fit-content;
        padding: var(--tooltip-padding);

        &:hover {
            cursor: auto;
        }

        .content {
            display: flex;
            flex-direction: column;
            gap: 0.5em;
        }

        .top {
        }

        .names {
        }

        .name {
            font-weight: 700;
            display: flex;
            gap: 0.2em;
            align-items: baseline;

            span {
                font-weight: 400;
            }
        }

        .icon {
            width: 8px;
            height: 8px;
            display: inline-block;
            border-radius: 8px;
            margin-right: 0.15em;

            &-name {
                background: #4c6edb;
            }

            &-warning {
                background: #4c6edb;

                width: 7px;
                height: 7px;
                position: relative;
                margin-right: 0.5em;

                &:after {
                    position: absolute;
                    content: "";
                    top: -4px;
                    left: -4px;
                    width: 11px;
                    height: 11px;
                    background: transparent;
                    border-radius: 10px;
                    border: 2px solid rgba(#4c6edb, 0.3);
                }
            }
        }

        .date {
            color: var(--grey-700);
        }

        h5 {
            margin: 0;
            font-weight: 500;
        }

        .data {
            display: flex;
            gap: 1em;
            border-bottom: var(--tooltip-rule);
            padding-bottom: 1em;
        }

        .fact {
            .number {
                font-weight: 600;
            }

            .label {
                opacity: 0.65;
            }
        }

        .percentage-chart {
            width: 100%;
            width: 200px;
            height: 100px;
        }

        .top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .tags {
            display: flex;
            flex-direction: column;
            gap: 0.125em;
            align-items: flex-end;
        }

        .tag {
            color: white;
            font-size: 0.8em;
            padding: 0.125em 0.2em;
            border-radius: 2px;
            text-align: right;
            font-weight: 500;
            line-height: 1.2;
            color: black;
            max-width: 13em;
        }

        .summary {
            font-size: 0.875em;
            padding-top: 1em;

            .title {
                font-weight: 600;
                margin-bottom: 0.6em;
                text-transform: capitalize;
            }

            p {
                margin: 0;
            }

            &-clamp {
                background: var(--grey-200);
                display: -webkit-box;
                -webkit-line-clamp: 4;
                -webkit-box-orient: vertical;
                overflow: scroll;
                padding: 0.35em 0.5em;
            }
        }

        .sources {
            font-size: 0.875em;
            opacity: 0.5;
            text-align: right;
            padding-top: 0.5em;
            display: flex;
            gap: 0.5em;
            justify-content: flex-end;
        }
    }
</style>
