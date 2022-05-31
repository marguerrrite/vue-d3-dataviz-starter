<script>
    import utils from "@/scripts/utils.js";

    import {
        scaleLinear,
        scaleBand,
        curveCardinal,
        scaleUtc,
        range,
        line,
        sum,
        max,
        min,
        timeFormat,
        timeSeconds,
        utcMinute,
        utcHour,
    } from "d3";

    export default {
        name: "GlobalHeatChart",
        props: {
            interval: {
                type: String,
                default: "daily",
            },
            yAccessor: {
                type: Function,
                default: d => d.mean,
            },
            xAccessor: {
                type: Function,
                default: d => d.year,
            },
        },
        data() {
            return {
                isLoading: true,
                resizeObserver: null,

                localDataUrl: "src/data/global-temperatures-datahub.csv",

                data: [], // processed data

                activeSource: "gcag",
                sources: [],

                dimensions: {
                    marginTop: 10,
                    marginRight: 10,
                    marginBottom: 60,
                    marginLeft: 40,
                    boundedWidth: 0,
                    boundedHeight: 0,
                    height: 0,
                    width: 0,
                },
                xScale: scaleBand(),
                yScale: scaleLinear(),

                dataPath: "",

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
                average = Object.values(average).reverse();
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
                        this.data[this.activeSource][0].year,
                        this.data[this.activeSource][this.data[this.activeSource].length - 1]
                            .year,
                    ])
                    .range([0, this.dimensions.boundedWidth]);
                this.yScale = scaleLinear()
                    .domain([this.minYValue, this.maxYValue])
                    .range([0, this.dimensions.boundedHeight]);
                this.generateLine();
            },
            generateLine() {
                let pathGenerator = () =>
                    line()
                        .x(d => this.xScale(d.year))
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
            onMouseMove(e) {
                let x = e.offsetX; // right edge of the chart
                let y = e.offsetY;

                // let hoveredDataBarHeight = this.yScale(this.yAccessor(this.barData[index])); // not listener-bar

                // let yOffset =
                //     this.dimensions.height -
                //     this.dimensions.marginTop -
                //     (hoveredDataBarHeight < 20 ? 20 : hoveredDataBarHeight);
                // let y = yOffset - 20;

                debugger;

                this.hoveredTooltipCoords = {x, y};
                this.hoveredTooltipData = ""
                // this.hoveredPeriodIndex = index;
            },
            onMouseLeave(e) {
                this.hoveredTooltipCoords = {x: 0, y: 0};
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
    <div class="insight-frequency" ref="container">
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
        <div v-if="!isLoading" class="chart-container">
            <GlobalHeatTooltip
                class="tooltip"
                :style="{
                    transform: `translate(${hoveredTooltipCoords.x}px, ${hoveredTooltipCoords.y}px)`,
                }"
            />
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
                    <path :d="dataPath" stroke="black" fill="none" class="data-path" />
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
                            :x="xScale(year)"
                            :style="{transform: `translate(0, 0)`}"
                        >
                            {{ year }}
                        </text>
                    </g>
                    <g class="x-ticks">
                        <line
                            v-for="rule in [-1, -0.5, 0, 0.5, 1]"
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
                            :x1="hoveredTooltipCoords.x - dimensions.marginLeft"
                            :x2="hoveredTooltipCoords.x - dimensions.marginLeft"
                            y1="0"
                            :y2="dimensions.boundedHeight"
                            stroke="black"
                        />
                    </g>
                    <g class="y-ticks">
                        <line
                            v-for="rule in yearTicks"
                            :key="rule"
                            :class="`y-rule y-rule-${rule}`"
                            :x1="xScale(rule)"
                            :x2="xScale(rule)"
                            y1="0"
                            :y2="dimensions.boundedHeight"
                            stroke="black"
                        />
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
                            :y="dimensions.boundedHeight - yScale(tick)"
                            :x="-25"
                            :style="{transform: `translate(0, -10px)`}"
                        >
                            {{ tick }}
                        </text>
                    </g>
                </g>
            </svg>
        </div>
    </div>
</template>

<style lang="scss">
    .insight-frequency {
        max-height: 300px;
        width: 100%;
        height: 100%;

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

            .y-axis {
                .tick-label {
                    font-size: 8px;
                }
            }
        }
    }
</style>
