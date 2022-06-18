<script>
    import utils from "@/scripts/utils.js";

    import {scaleLinear, scaleUtc, range, line, scan} from "d3";

    export default {
        name: "GlobalHeatChartUnstyled",
        props: {
            yAccessor: {
                type: Function,
                default: d => d.mean,
            },
            xAccessor: {
                type: Function,
                default: d => new Date(d.year),
            },
        },
        data() {
            return {
                isLoading: true,
                resizeObserver: null,

                localDataUrl: "./data/global-temperatures-datahub.csv",

                data: [], // processed data

                activeSource: "average",
                sources: [],

                dimensions: {
                    marginTop: 10,
                    marginRight: 10,
                    marginBottom: 60,
                    marginLeft: 60,
                    boundedWidth: 0,
                    boundedHeight: 0,
                    height: 0,
                    width: 0,
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
                return 1.1;
            },
            minYValue() {
                return -0.5;
            },
            yearTicks() {
                return range(1880, 2020, 20);
            },
            middleYear() {
                //from range above ^ in yearTicks
                return 1880 + (2016 - 1880) / 2;
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
                // Dataset comes with 2 sources. Let's decouple.
                let gcag = [];
                let gistemp = [];
                let average = {};
                data.forEach(row => {
                    row.mean = parseFloat(row.mean);

                    if (row.source.toLowerCase() == "gcag") {
                        gcag.push(row);
                    } else {
                        gistemp.push(row);
                    }

                    if (!average[row.year]) {
                        average[row.year] = {
                            mean: row.mean,
                            sourve: "Average",
                            year: row.year,
                        };
                    } else {
                        // update with average
                        average[row.year]["mean"] =
                            (average[row.year]["mean"] + row.mean) / 2;
                    }
                });
                gcag = gcag.reverse();
                gistemp = gistemp.reverse();
                average = Object.values(average);
                this.data = {gcag, gistemp, average};
                this.sources = Object.keys(this.data);
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
                if (!this.data[this.activeSource]) {
                    return;
                }

                this.xScale = scaleUtc()
                    .domain([
                        new Date(this.data[this.activeSource][0].year),
                        new Date(
                            this.data[this.activeSource][
                                this.data[this.activeSource].length - 1
                            ].year
                        ),
                    ])
                    .range([0, this.dimensions.boundedWidth]);
                this.yScale = scaleLinear()
                    .domain([this.maxYValue, this.minYValue - 0.25])
                    .range([0, this.dimensions.boundedHeight]);
                this.generateLine();
            },
            generateLine() {
                let pathGenerator = () =>
                    line()
                        .x(d => this.xScale(new Date(d.year)))
                        .y(d => this.yScale(d.mean));

                this.dataPath = pathGenerator()([...this.data[this.activeSource]]);
                this.isLoading = false;
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
                let closestIndex = scan(this.data[this.activeSource], (a, b) => {
                    return getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b);
                });

                let attach = "right";
                if (this.tooltipWidth + x > this.dimensions.boundedWidth) {
                    attach = "left";
                }

                this.hoveredTooltipCoords = {x, y, attach};
                this.hoveredPeriodData = this.data[this.activeSource][closestIndex];
                this.hoveredPeriodIndex = closestIndex;
            },
            onMouseMove(e) {
                utils.debounce(this.setTooltip(e), 9000);
            },
            onMouseLeave(e) {
                this.hoveredTooltipCoords = {
                    x: 0,
                    y: 0,
                    attach: "right",
                    width: this.tooltipWidth,
                };
                this.hoveredPeriodData = {};
                this.hoveredPeriodIndex = -1;
            },
        },
        watch: {
            data() {
                if (this.data.gistemp) {
                    this.setDimensions();
                }
            },
            activeSource() {
                this.setDimensions();
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
    <div class="global-heat-chart-unstyled">
        <div class="metas">
            <h2>Monthly Temperature Anomalies °C, 1880 &ndash; 2016</h2>
            <div class="description">
                Source:
                <Link to="https://datahub.io/core/global-temp#data" do-open-in-new-tab>
                    GISS Surface Temperature (GISTEMP) analysis and Climate at a Glance
                    (GCAG)
                </Link>
            </div>
        </div>

        <div class="actions">
            <Button
                @click="changeActiveDataset(source)"
                :class="{inactive: activeSource != source}"
                v-for="source in sources"
                :key="source"
            >
                {{ source }}
            </Button>
        </div>
        <div v-if="isLoading">Loading data...</div>
        <div class="chart-container" ref="container">
            <template v-if="!isLoading">
                <div
                    :style="{
                        transform: `translate(${
                            hoveredTooltipCoords.x + dimensions.marginLeft
                        }px, ${hoveredTooltipCoords.y}px)`,
                        opacity: hoveredPeriodData.year ? 1 : 0,
                    }"
                >
                    <GlobalHeatTooltipUnstyled
                        ref="heat-tooltip"
                        class="tooltip"
                        :data="hoveredPeriodData"
                        :width="tooltipWidth"
                        :style="{
                            transform: `translate(${
                                hoveredTooltipCoords.attach == 'right' ? '5' : '-105'
                            }%, -50%)`,
                        }"
                    />
                </div>

                <svg
                    @mouseleave="onMouseLeave"
                    @mousemove="onMouseMove"
                    class="chart"
                    :width="dimensions.width"
                    :height="dimensions.height"
                >
                    <g
                        :transform="`translate(${dimensions.marginLeft}, ${dimensions.marginTop})`"
                    >
                        <path
                            :d="dataPath"
                            stroke="black"
                            fill="none"
                            class="data-path"
                        />
                        <g
                            class="x-ticks"
                            :style="{
                                transform: `translate(0, ${dimensions.boundedHeight}px)`,
                            }"
                        >
                            <text
                                class="tick-label"
                                v-for="year in yearTicks"
                                :key="year"
                                :x="xScale(new Date(year.toString()))"
                                :style="{transform: `translate(0, 10px)`}"
                            >
                                {{ year }}
                            </text>
                        </g>
                        <g class="x-ticks">
                            <line
                                v-for="rule in [-0.5, 0, 0.5, 1]"
                                :key="rule"
                                :class="`x-rule x-rule-${rule}`"
                                :y1="yScale(rule)"
                                :y2="yScale(rule)"
                                x1="0"
                                :x2="dimensions.boundedWidth"
                                stroke="black"
                            />
                        </g>
                        <g class="y-tooltip">
                            <line
                                :class="`y-rule y-rule-tooltip`"
                                :x1="hoveredTooltipCoords.x"
                                :x2="hoveredTooltipCoords.x"
                                y1="0"
                                :y2="dimensions.boundedHeight"
                                stroke="black"
                            />
                        </g>
                        <g class="y-ticks">
                            <line
                                v-for="year in yearTicks"
                                :key="year"
                                :x1="xScale(new Date(year.toString()))"
                                :x2="xScale(new Date(year.toString()))"
                                :class="`y-rule y-rule-${year}`"
                                y1="0"
                                :y2="dimensions.boundedHeight"
                                stroke="black"
                            />
                            <text
                                class="x-tick-label"
                                :x="xScale(new Date(middleYear.toString()))"
                                :y="dimensions.height - 30"
                            >
                                Year
                            </text>
                        </g>
                        <g class="y-axis">
                            <line
                                class="y-rule"
                                y1="0"
                                :y2="dimensions.boundedHeight"
                                stroke="black"
                            />
                            <text
                                class="tick-label"
                                v-for="tick in [-0.5, 0, 0.5, 1]"
                                :key="tick"
                                :y="yScale(tick) + dimensions.marginTop"
                                :x="-25"
                                :style="{transform: `translate(0, -10px)`}"
                            >
                                {{ tick }}
                            </text>
                        </g>
                        <g
                            :style="{
                                transform: `translate(-40px, ${yScale(0) - 4}px)`,
                            }"
                        >
                            <text
                                class="y-tick-label"
                                :x="0"
                                :y="0"
                                :style="{transform: `translate(0, 0px) rotate(-90deg)`}"
                            >
                                Mean (°C)
                            </text>
                        </g>
                    </g>
                </svg>
            </template>
        </div>
    </div>
</template>

<style lang="scss">
    .global-heat-chart-unstyled {
        height: 100%;
        width: 100%;
        height: 100%;
        overflow: hidden;

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

        .global-heat-tooltip-unstyled {
            position: absolute;
            transition: 10ms linear all;
        }

        .chart-container {
            width: 100%;
            height: 100%;
            height: 300px;
        }

        .chart {
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
