<script>
    import utils from "@/scripts/utils.js";

    import {scaleLinear, scaleUtc, range, line, scan, max, min, timeFormat} from "d3";

    export default {
        name: "MassShootingPlot",
        props: {
            yAccessor: {
                type: Function,
                default: d => d.age_of_shooter,
            },
            xAccessor: {
                type: Function,
                default: d => new Date(d.date),
            },
        },
        data() {
            return {
                isLoading: true,
                resizeObserver: null,

                localDataUrl: "src/data/mass-shooting-mother-jones.csv",

                data: [], // processed data

                dimensions: {
                    marginTop: 10,
                    marginRight: 10,
                    marginBottom: 60,
                    marginLeft: 60,
                    boundedWidth: 0,
                    boundedHeight: 0,
                    height: 0,
                    width: 0,
                    axisOffset: 35,
                },
                xScale: scaleUtc(),
                yScale: scaleLinear(),

                dataPath: "",
                tooltipWidth: 200,

                hoveredTooltipCoords: {x: 0, y: 0},
                hoveredPeriodData: {},
                hoveredPeriodIndex: -1,
            };
        },
        computed: {
            maxYValue() {
                return max(this.data, this.yAccessor);
            },
            minYValue() {
                //return 0
                return min(this.data, this.yAccessor);
            },
            yearTicks() {
                return range(1982, 2024, 8);
            },
            middleYear() {
                //from range above ^ in yearTicks
                return 1982 + (2020 - 1982) / 2;
            },
        },
        methods: {
            loadData() {
                this.$papa.parse(this.localDataUrl, {
                    download: true,
                    header: true, // gives us a data object with the headers as key names
                    error: (err, file, inputElem, reason) => {
                        console.log(reason);
                    },
                    complete: data => {
                        this.processData(data.data);
                    },
                });
            },
            processData(data) {
                let cleanData = []
                data.forEach(row => {
                    let newDate = new Date(row.date)
                    row.date = newDate
                    cleanData.push(row);
                })
                this.data = cleanData.sort((a, b) => {
                    return new Date(a.date) - new Date(b.date);
                });

                this.isLoading = false;
            },
            setDimensions() {
                let box = this.$refs.container?.getBoundingClientRect();
                this.dimensions.width = box.width;
                this.dimensions.height = box.height;
                this.dimensions.boundedHeight =
                    box.height - this.dimensions.marginTop - this.dimensions.marginBottom;
                this.dimensions.boundedWidth =
                    box.width - this.dimensions.marginLeft - this.dimensions.marginRight;
                this.setScales();
            },
            setScales() {
                if (!this.data[0]) {
                    return;
                }

                this.xScale = scaleUtc()
                    .domain([
                        new Date('1982'), // we want the beginning of the years instead of the exact start/end dates
                        new Date('2024'),
                    ])
                    .range([0, this.dimensions.boundedWidth]);
                this.yScale = scaleLinear()
                    .domain([this.maxYValue, this.minYValue - 0.25])
                    .range([0, this.dimensions.boundedHeight]);
            },
            changeActiveDataset(newSet) {
                if (!this.sources.includes(newSet)) {
                    return;
                }
                this.activeSource = newSet;
            },
            setTooltip(e) {
                let x = e.offsetX - this.dimensions.marginLeft; // left edge of the chart
                let y = e.offsetY;

                let hoveredDate = this.xScale.invert(x);
                let getDistanceFromHoveredDate = d => {
                    return Math.abs(
                        this.xScale(this.xAccessor(d)) - this.xScale(hoveredDate)
                    );
                };
                let closestIndex = scan(this.data, (a, b) => {
                    return getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b);
                });

                let attach = "right";
                if (this.tooltipWidth + x > this.dimensions.boundedWidth) {
                    attach = "left";
                }

                this.hoveredTooltipCoords = {x, y, attach};
                this.hoveredPeriodData = this.data[closestIndex];
                this.hoveredPeriodIndex = closestIndex;
            },
            // onMouseMove(e) {
            //     utils.debounce(this.setTooltip(e), 9000);
            // },
            // onMouseLeave(e) {
            //     this.hoveredTooltipCoords = {
            //         x: 0,
            //         y: 0,
            //         attach: "right",
            //         width: this.tooltipWidth,
            //     };
            //     this.hoveredPeriodData = {};
            //     this.hoveredPeriodIndex = -1;
            // },
        },
        watch: {
            data: {
                handler() {
                    if (this.data[0].date) {
                        this.setDimensions();
                    }
                },
            },
        },
        async mounted() {
            this.loadData();
            this.resizeObserver = new ResizeObserver(
                utils.animationFrame(this.setDimensions)
            );
            this.resizeObserver.observe(this.$el);
        },

        beforeUnmount() {
            this.resizeObserver.disconnect();
        },
    };
</script>

<template>
    <div class="mass-shooting-plot">
        <div class="metas">
            <h2>Ages of US Mass Shooters, 1982 &ndash; 2022</h2>
            <div class="description">
                Source:
                <Link
                    to="https://www.motherjones.com/politics/2012/12/mass-shootings-mother-jones-full-data/"
                    do-open-in-new-tab
                >
                    Mother Jones
                </Link>
            </div>
            <label for=""> Last updated Jun 7, 2022 </label>
        </div>

        <div v-if="isLoading">Loading data...</div>
        <div class="chart-container" ref="container">
            <template v-if="!isLoading">
                <!-- <div
                    :style="{
                        transform: `translate(${
                            hoveredTooltipCoords.x + dimensions.marginLeft
                        }px, ${hoveredTooltipCoords.y}px)`,
                        opacity: hoveredPeriodData.date ? 1 : 0,
                    }"
                >
                   tooltip
                </div> -->

                <svg
                    @mouseleave="onMouseLeave"
                    @mousemove="onMouseMove"
                    class="chart"
                    :width="dimensions.width"
                    :height="dimensions.height"
                >
                    <!-- <rect
                        :opacity="0.26"
                        :width="dimensions.width"
                        :height="dimensions.height"
                    ></rect> -->
                    <g
                        :transform="`translate(${dimensions.marginLeft}, ${dimensions.marginTop})`"
                    >
                        <g class="data-plot">
                            <g
                                class="shooter-container"
                                v-for="shooter in data"
                                :key="shooter"
                                :style="{
                                    transform: `translate(${xScale(
                                        xAccessor(shooter)
                                    )}px, ${yScale(yAccessor(shooter))}px)`,
                                }"
                            >
                                <circle r="4"></circle>
                            </g>
                        </g>
                    </g>
                    <g
                        class="axes"
                        :style="{
                            transform: `translate(0, ${dimensions.marginTop}px)`,
                        }">
                    </g>
                    <g
                        class="axes"
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                        }"
                    >
                        <!-- <line
                            class="y-rule"
                            :y2="dimensions.boundedHeight"
                            stroke="black"
                        /> -->
                        <line
                            class="x-rule"
                            :x2="dimensions.boundedWidth"
                            :y1="dimensions.boundedHeight"
                            :y2="dimensions.boundedHeight"
                            stroke="black"
                        />
                    </g>
                    <g
                        class="x-rules"
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                        }"
                    >
                        <line
                            class="y-rule"
                            v-for="year in yearTicks"
                            :key="year"
                            :x1="xScale(new Date(year.toString()))"
                            :x2="xScale(new Date(year.toString()))"
                            :y2="dimensions.boundedHeight"
                            stroke="black"
                        />
                    </g>
                    <g
                        class="7-ticks"
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${
                                dimensions.marginTop}px)`,
                        }"
                    >
                        <text
                            class="y-tick-label"


                            y="20"
                        >
                            age
                        </text>
                        <text
                            class="x-tick-label"
                            :x="xScale(new Date(middleYear.toString()))"
                            :y="40"
                        >
                            ages
                        </text>
                    </g>
                    <g
                        class="x-ticks"
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${
                                dimensions.marginTop + dimensions.boundedHeight
                            }px)`,
                        }"
                    >
                        <text
                            class="x-tick-label"
                            v-for="year in yearTicks"
                            :key="year"
                            :x="xScale(new Date(year.toString()))"
                            y="20"
                        >
                            {{ year }}
                        </text>
                        <text
                            class="x-tick-label"
                            :x="xScale(new Date(middleYear.toString()))"
                            :y="40"
                        >
                            Year
                        </text>
                    </g>
                </svg>
            </template>
        </div>
    </div>
</template>

<style lang="scss">
    .mass-shooting-plot {
        height: 100%;
        width: 100%;

        .metas {
            margin-bottom: 2em;

            h1,
            h2,
            h3 {
                margin: 0;
            }

            h3 {
                opacity: 0.5;
                font-weight: 500;
                margin: 0.25em 0;
            }

            .description {
                margin: 1em 0;
            }
        }

        .actions {
            display: flex;
            gap: 0.35em;

            .inactive {
                background: var(--grey-300);
            }
        }

        .tooltip {
            position: absolute;
            transition: 10ms linear all;
        }

        .chart-container {
            width: 100%;
            height: 100%;
        }

        .chart {
            height: 100%;
            max-height: 300px;

            .data-path {
                transition: all 100ms linear;
            }

            .x-rule {
                opacity: 0.1;

                &.x-rule-0 {
                    opacity: 0.3;
                }
            }
            .y-rule {
                opacity: 0.1;
            }

            .y-rule-tooltip {
                transition: 100ms linear all;
                opacity: 0.5;
            }

            .x-ticks {
                .tick-label {
                    font-size: 8px;
                    text-anchor: middle;
                }
            }

            .y-tick-label {
                font-size: 0.7em;
                fill: red;
                text-anchor: middle;
            }

            .x-tick-label {
                font-size: 0.7em;
                text-anchor: middle;
            }

            .y-axis {
                .tick-label {
                    font-size: 8px;
                }
            }
        }
    }
</style>
