<script>
    import {timeFormat, scaleLinear, scaleBand, range as d3Range} from "d3";
    import {max} from "d3-array";

    import utils from "@/scripts/utils.js";

    //import Bars from "@/pages/goals/charts/Bars.vue";

    // Used for Goal Detail Historical

    export default {
        name: "HistoricalGoalChart",
        components: {
            //Bars,
        },
        props: {
            data: Object,
            goal: Object,
            target: Number,
            progressSentiment: Object,
            yAccessor: {
                type: Function,
                default: d => d.count,
            },
            xAccessor: {
                type: Function,
                default: d => d.start,
            },
        },
        emits: ["selected"],
        data() {
            return {
                resizeObserver: null,
                loading: true,

                dimensions: {
                    marginTop: 10,
                    marginRight: 10,
                    marginBottom: 20,
                    marginLeft: 10,
                    boundedWidth: 0,
                    boundedHeight: 0,
                    height: 0,
                    width: 0,
                },
                xScale: scaleBand(),
                yScale: scaleLinear(),
                totalBarCount: 1,

                hoveredTooltipCoords: {x: 0, y: 0},
                hoveredPeriodData: {}, // para tooltip
                hoveredPeriodIndex: -1,

                maxBarsAllowed: 6,
                barPadding: 4,
            };
        },
        computed: {
            maxYValue() {
                let dataMax = max(this.data, this.yAccessor);
                return dataMax < this.target ? this.target : dataMax;
            },
            barData() {
                return this.data
                    .slice()
                    .reverse()
                    .slice(0, this.maxBarsAllowed + 1);
            },
        },
        methods: {
            setDimensions() {
                let box = this.$refs.container?.getBoundingClientRect();
                this.dimensions.width = box.width;
                this.dimensions.height = box.height;
                this.dimensions.boundedHeight = box.height - this.dimensions.marginTop - this.dimensions.marginBottom;
                this.dimensions.boundedWidth = box.width - this.dimensions.marginLeft - this.dimensions.marginRight;
                this.setScales();
            },
            setScales() {
                this.totalBarCount = this.barData.length;
                this.totalBarCount = 7;
                this.xScale = scaleBand().domain(d3Range(this.totalBarCount)).range([0, this.dimensions.boundedWidth]);
                this.yScale = scaleLinear().domain([0, this.maxYValue]).range([0, this.dimensions.boundedHeight]);
                this.loading = false;
            },
            onMouseMove(e, index) {
                let x = this.dimensions.width - this.dimensions.marginRight - this.barPadding; // right edge of the chart
                x = x - this.xScale(index); // move over x bars
                x = x - e.currentTarget.getBoundingClientRect().width / 2; // nudge over half a barWidth

                let hoveredDataBarHeight = this.yScale(this.yAccessor(this.barData[index])); // not listener-bar

                let yOffset =
                    this.dimensions.height -
                    this.dimensions.marginTop -
                    (hoveredDataBarHeight < 20 ? 20 : hoveredDataBarHeight);
                let y = yOffset - 20;

                this.hoveredTooltipCoords = {x, y};
                this.hoveredPeriodData = this.barData[index];
                this.hoveredPeriodIndex = index;
            },
            onMouseLeave(e) {
                this.hoveredTooltipCoords = {x: 0, y: 0};
                this.hoveredPeriodData = {};
                this.hoveredPeriodIndex = -1;
            },
            formatDate(date) {
                let dateFormat = timeFormat("%b %d, %Y");
                return dateFormat(new Date(date));
            },
            formatXTick(startDate, endDate, frequency) {
                let label = "";
                if (frequency == "monthly") {
                    let monthFormat = timeFormat("%b");
                    if (frequency == "monthly") {
                        label = monthFormat(new Date(startDate));
                    } else if (frequency == "quarterly") {
                        label = monthFormat(new Date(startDate));
                    }
                } else {
                    label = `Q${utils.getDateQuarter(startDate)}`;
                    if (label.includes("1")) {
                        let yearAbbreviation = new Date(startDate).getFullYear().toString().substr(-2);
                        label = `${label} '${yearAbbreviation}`;
                    }
                }
                return label;
            },
            getPeriodResult(finalCount) {
                let target = this.goal.goal;
                let sentiment = "";
                let delta = 0;

                if (finalCount >= target) {
                    sentiment = "completed";
                } else {
                    sentiment = "missed";
                }

                delta = Math.abs(finalCount - target);

                return {sentiment, delta};
            },
        },
        watch: {
            data() {
                this.setDimensions();
            },
            loadData() {
                this.$papa.parse("src/data/planned-parenthood-services-2014.csv", {
                    download: true,
                    header: true, // gives us a data object with the headers as key names
                    error: (err, file, inputElem, reason) => {
                        console.log(reason);
                    },
                    complete: data => {
                        this.data = this.processData(data.data);
                    },
                });
            },
            processData(data) {
                let processedData = [...data];
                processedData.forEach((row, index) => {
                    row["percentage_of_procedures"] = parseInt(row["percentage_of_procedures"].replaceAll("%", "")) / 100
                    row["number_of_procedures"] = parseInt(row["number_of_procedures"])
                })
                return processedData;
            },
        },
        mounted() {
            // this.resizeObserver = new ResizeObserver(utils.animationFrame(this.setDimensions));
            // this.resizeObserver.observe(this.$el);
            // this.setDimensions();
            this.loadData();
        },

        beforeUnmount() {
            this.resizeObserver.disconnect();
        },
    };
</script>

<template>
    <div class="goal-barchart" ref="container">
        <!-- <svg
            class="chart"
            v-if="!loading && data"
            @mouseleave="onMouseLeave()"
            :width="dimensions.width"
            :height="dimensions.height"
        >
            <g :transform="`translate(${dimensions.marginLeft}, ${dimensions.marginTop})`">
                <g class="x-axis" :style="{transform: `translate(0, ${dimensions.boundedHeight}px)`}">
                    <line x1="0" :x2="dimensions.boundedWidth" stroke="black" />
                    <text
                        class="tick-label"
                        v-for="(d, index) in barData"
                        :key="d"
                        :x="dimensions.boundedWidth - xScale(index) - xScale.bandwidth() / 2 - 4"
                        :style="{transform: `translate(0, 12px)`}"
                    >
                        {{ formatXTick(d.start, d.end, goal.period) }}
                    </text>
                </g>
                <Bars
                    v-if="!loading"
                    :data="barData"
                    :goal-params="goal"
                    :dimensions="dimensions"
                    :x-scale="xScale"
                    :y-scale="yScale"
                    :y-accessor="yAccessor"
                    :x-accessor="xAccessor"
                    :target="target"
                    :mouseover="onMouseMove"
                    :bar-padding="barPadding"
                    :hovered-period-index="hoveredPeriodIndex"
                    :progress-sentiment="progressSentiment.progressSentiment"
                />

                <g class="target" :style="{transform: `translate(0, ${dimensions.boundedHeight - yScale(target)}px)`}">
                    <line class="target-rule" x1="0" :x2="dimensions.width" stroke="black" />
                </g>
            </g>
        </svg> -->
    </div>
</template>

<style lang="scss">
    .goal-barchart {
        width: 100%;
        height: 100%;
        position: relative;

        .no-historical-message {
            position: absolute;
            transform: translate(0.6rem, -1.75rem);
            bottom: 0;
            font-size: 0.75rem;
            color: var(--label);
            opacity: 0.5;
        }

        .target-label {
            position: absolute;
            font-size: 0.8em;
            height: 16px;
            top: 0;
            right: 0;
            transform: translate(95%, 0.15em);
            background: var(--base-6);
            padding: 2px 0.25em;
            border-radius: 2px;
            color: var(--base);
            line-height: 1;

            &::before {
                width: 0;
                height: 0;
                z-index: 10;
                content: "";
                left: -6.75px;
                top: 0px;
                position: absolute;
                border-style: solid;
                border-width: 8px 8px 8px 0;
                border-radius: 1px;
                border-color: transparent var(--base-6) transparent transparent;
            }

            .metric {
                text-transform: lowercase;
                font-size: 0.85em;
            }
        }

        .tooltip {
            position: absolute;
            top: 0;
            transform: translate(-50%, -100%);
            transition: 50ms all linear;

            width: 12rem;
            background: var(--base-0);
            font-size: 0.9em;
            padding: 0.5em 0.75em;
            border: var(--border) 1px solid;
            color: var(--base-text);
            box-shadow: 0 2px 6px 0px rgba(black, 0.1);

            .dates {
                font-size: 0.85em;
                text-align: center;
                opacity: 0.6;
            }

            .count {
                text-align: center;
                margin-top: 0.25em;
                margin-bottom: 0.25em;

                span {
                    font-weight: 600;
                }
            }

            .sentiment {
                text-align: center;
                font-size: 0.85em;

                &:first-letter {
                    text-transform: capitalize;
                }

                span {
                    text-transform: lowercase;
                }

                &.active {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 1em;

                    .ring-container {
                        position: relative;
                        width: 7px;
                        height: 7px;
                        margin-right: 0.35em;
                    }

                    .circle {
                        width: 7px;
                        height: 7px;
                        background-color: var(--data);
                        border-radius: 50%;
                        position: absolute;
                    }

                    .ringring {
                        border: 5px solid var(--data);
                        border-radius: 30px;
                        height: 13px;
                        width: 13px;
                        top: 50%;
                        left: 50%;
                        margin-left: -6.5px;
                        margin-top: -6.5px;
                        position: absolute;
                        animation: pulsate 3s ease-out;
                        animation-iteration-count: infinite;
                        opacity: 0;
                    }
                    @keyframes pulsate {
                        0% {
                            transform: scale(0.1, 0.1);
                            opacity: 0;
                        }
                        10% {
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.2, 1.2);
                            opacity: 0;
                        }
                    }
                }
            }

            .completion {
                text-align: center;
                font-size: 0.85em;
            }
        }

        svg.chart {
            width: 100%;
            height: 100%;
        }

        .x-axis {
            line {
                stroke: var(--border);
            }
        }

        .tick-label {
            font-size: 0.6em;
            fill: var(--label);
            text-anchor: middle;
        }

        .target-rule {
            opacity: 0.5;
            pointer-events: none;
            stroke: var(--base-text-2);
        }
    }
</style>
