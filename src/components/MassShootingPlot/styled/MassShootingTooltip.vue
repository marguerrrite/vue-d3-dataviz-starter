<script>
    import {scaleLinear, scaleUtc, range, line, scan, max, min, timeFormat} from "d3";
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
            maxVictimData: {
                type: Object,
                required: true,
            },
        },
        data() {
            return {};
        },
        computed: {
            humanDate() {
                let dateFormat = "%b %d, %Y";
                return timeFormat(dateFormat)(this.data.date);
            },
            isUnder30() {
                return parseInt(this.data.age_of_shooter) <= 30;
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
        }"
    >
        <div v-if="data?.year">
            <div class="metas">
                <div class="top">
                    <div class="name">
                        {{ data.shooter_name }}
                        <span class="age">({{ data.age_of_shooter }})</span>
                    </div>
                    <div class="tag" v-if="isUnder30">Under 30</div>
                </div>
                <h5 class="date">{{ humanDate }}</h5>
            </div>
            <div class="legality">
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
                <div>
                    Previous signs of mental health issues:
                    {{ data.prior_signs_mental_health_issues }}
                </div>
            </div>

            <!-- <div class="summary">
                {{ data.summary }}
            </div> -->
        </div>
    </div>
</template>

<style lang="scss">
    .mass-shooting-tooltip {
        --tooltip-padding: 0.45em 0.55em;
        --tooltip-rule: 1px solid var(--grey-300);

        background: white;
        width: 100%;
        pointer-events: none;
        font-size: 0.85em;
        border-radius: 3px;
        box-shadow: 0 2px 6px 0px rgba(black, 0.1);
        border: 1px solid var(--grey-300);

        .metas,
        .legality {
            padding: var(--tooltip-padding);
            border-bottom: var(--tooltip-rule);
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
            align-items: center;
        }

        .tag {
            background: var(--forest-green-100);
            color: var(--forest-green-700);
            font-size: 0.8em;
            padding: 0.125em 0.2em;
            font-weight: 600;
        }

        .summary {
            max-height: 50px;
            overflow-y: auto;
            font-size: 0.85em;
            background: var(--grey-200);
            padding: 0.5em;
        }
    }
</style>
