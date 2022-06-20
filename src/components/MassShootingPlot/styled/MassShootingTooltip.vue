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
                priorColor: interpolateCool(0.8)
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
                } else if (this.data.weapons_obtained_legally.toLowerCase() == "no") {
                    return 0;
                } else {
                    return -1;
                }
            },
            sources() {
                return [...this.data.sources.split(";")];
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
        <div v-if="data?.year">
            <div class="metas">
                <div class="top">
                    <div class="name">
                        {{ data.shooter_name }}
                        <span class="age">({{ data.age_of_shooter }})</span>
                    </div>
                    <div class="tags">
                        <div class="tag prior-signs" v-if="didShowPriorSigns"
                            :style="{
                                background: priorColor
                        }">
                            Mental health issues
                        </div>
                    </div>
                </div>
                <h5 class="date">{{ data.city }}</h5>
                <h5 class="date">
                    {{ data.case }}
                </h5>
            </div>
            <!-- <div class="legality">
                <div>
                    Obtained weapons legally:
                    {{
                        obtainedWeaponsLegally == 1
                            ? "yes"
                            : obtainedWeaponsLegally == 0
                            ? "no "
                            : "unknown"
                    }}
                </div>
            </div> -->
            <!-- <div class="summary">
                <span v-for="source in sources" :key="source">{{source}}</span>
            </div> -->
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
            rgba(0, 0, 0, 0.07) 0px 2px 4px,
            rgba(0, 0, 0, 0.07) 0px 4px 8px,
            rgba(0, 0, 0, 0.07) 0px 8px 16px,
            rgba(0, 0, 0, 0.07) 0px 16px 32px,
            rgba(0, 0, 0, 0.07) 0px 32px 64px;
        min-height: 1em;
        z-index: 200;
        height: 100%;

        &:hover {
            cursor: auto;
        }

        .metas,
        .legality {
            padding: var(--tooltip-padding);
            //border-bottom: var(--tooltip-rule);
        }

        .metas {
            padding-top: 1.1rem;
        }

        .name {
            font-weight: 700;

            span {
                font-weight: 400;
            }
        }

        .date {
            color: var(--grey-700);
        }

        h5 {
            margin: 0;
            font-weight: 500;
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
            background: #ffebe6;
            color: white;
            font-size: 0.8em;
            padding: 0.125em 0.2em;
            font-weight: 600;
            white-space: nowrap;
            border-radius: 2px;
            color: black;
        }

        .summary {
            max-height: 50px;
            overflow-y: auto;
            background: var(--grey-200);
            padding: var(--tooltip-padding);
        }
    }
</style>
