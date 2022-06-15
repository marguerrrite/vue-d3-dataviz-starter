<script>
import utils from "@/scripts/utils.js";

import { scaleLinear, scaleBand, scaleUtc, range, line, scan, max, curveCardinal, scaleSequential, interpolateCool, interpolateRdYlBu, schemeRdYlBu } from "d3";

export default {
    name: "GlobalHeatChart",
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

            localDataUrl: "src/data/noaa-data.csv",

            data: [], // processed data

            activeSource: "average",
            sources: [],

            dimensions: {
                marginTop: 30,
                marginRight: 30,
                marginBottom: 60,
                marginLeft: 60,
                boundedWidth: 0,
                boundedHeight: 0,
                height: 0,
                width: 0,
            },
            xScale: scaleUtc(),
            yScale: scaleLinear(),
            xBandScale: scaleBand(),
            colorScale: scaleSequential(),

            birth: 1989,

            period: {
                start: 1880,
                end: 2022
            },

            barWidth: 1,

            dataPath: "",
            colorRange: ["#F55951", "#F1E8E6", "#5577F5"],

            activeUnit: "f", // f || c

            tooltipWidth: 200,

            hoveredTooltipCoords: { x: 0, y: 0 },
            hoveredPeriodData: {},
            hoveredPeriodIndex: -1,

            yTicks: [-0.5, 0, 0.5],
        };
    },
    computed: {
        maxYValue() {
            return 1;
            //return max(this.data, this.yAccessor)
        },
        minYValue() {
            return -0.75;
        },
        yOffset() {
            return this.yScale(0.75);
        },
        decadeTicks() {
            return range(this.period.start, this.period.end, 20);
        },
        yearTicks() {
            return range(this.period.start, this.period.end, 2);
        },
        middleYear() {
            //from range above ^ in yearTicks
            return this.period.start + (this.period.end - this.period.start) / 2;
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
            let processedData = [...data];
            processedData.forEach(row => {
                row.mean = parseFloat(row.mean);
            });

            processedData = processedData.filter(row => row.year >= this.period.start && row.year <= this.period.end)
            this.data = processedData;
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

            // x scales
            this.xScale = scaleUtc()
                .domain([
                    new Date(this.period.start.toString()),
                    new Date(this.period.end.toString()),
                ])
                .range([0, this.dimensions.boundedWidth]);
            this.xBandScale = scaleBand()
                .domain(range(this.period.start, this.period.end))
                .range([0, this.dimensions.boundedWidth]);


            // y scales
            this.yScale = scaleLinear()
                .domain([this.maxYValue, this.minYValue])
                .range([0, this.dimensions.boundedHeight]);

            let colorLinearScale = scaleLinear()
                .domain([1, 0])
                .range([0, this.dimensions.boundedHeight])
            this.colorScale = scaleSequential(colorLinearScale.domain(), interpolateRdYlBu)

            let barPadding = 1;
            this.barWidth = this.xBandScale.bandwidth() - barPadding;

            this.generateLine();
        },
        generateLine() {
            let pathGenerator = () =>
                line()
                    .x(d => this.xScale(new Date(d.year)))
                    .y(d => this.yScale(d.mean))
                    .curve(curveCardinal.tension(0.2));

            this.dataPath = pathGenerator()([...this.data]);

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
            let closestIndex = scan(this.data, (a, b) => {
                return getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b);
            });

            let attach = "right";
            if (this.tooltipWidth + x > this.dimensions.boundedWidth) {
                attach = "left";
            }

            this.hoveredTooltipCoords = { x, y, attach };
            this.hoveredPeriodData = this.data[closestIndex];
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
            if (this.data[0]) {
                this.setDimensions();
            }
        },
        period: {
            deep: true,
            handler() {
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
    <div class="global-heat-chart">
        <div class="metas">
            <h2>It's always the hottest decade (as of late 🔥😬)</h2>
            <!-- <h3>
                Global average surface temperatures have risen at a rate of about 0.73°C
                per century
            </h3>
            <div class="description">
                Monthly Temperature Anomalies °C, 1880 &ndash; 2016 &nbsp; &nbsp; &nbsp;
                Source:
                <Link to="https://datahub.io/core/global-temp#data" do-open-in-new-tab>
                GISS Surface Temperature (GISTEMP) analysis and Climate at a Glance
                (GCAG)
                </Link>
            </div> -->
        </div>

        <div v-if="isLoading">Loading data...</div>
        <div class="card">
            <div class="card-metas">
                <h3>
                    10 warmest years on record have occurred since 2005
                </h3>
                <!-- <h3>
                    10 warmest years on record have occurred since 2005
                </h3> -->
                <div class="description">
                    Monthly Temperature Anomalies °C, 1880 &ndash; 2022 &nbsp; &nbsp; &nbsp;
                    Source:
                    <Link to="https://www.ncdc.noaa.gov/cag/global/time-series" do-open-in-new-tab>
                    NOAA
                    </Link>
                </div>
            </div>
            <div class="chart-container" ref="container">
                <div class="chart-top">
                    <div class="summary"></div>
                    <div class="actions">
                        <label for="">Data sources</label>
                        <div class="toggle">
                            <Button @click="changeActiveDataset(source)" :class="{ inactive: activeSource != source }"
                                v-for="source in sources" class="toggle-button" :key="source">
                                {{ source }}
                            </Button>
                        </div>
                    </div>
                </div>

                <template v-if="!isLoading">
                    <div :style="{
                        transform: `translate(${hoveredTooltipCoords.x + dimensions.marginLeft
                            }px, ${hoveredTooltipCoords.y}px)`,
                        opacity: hoveredPeriodData.year ? 1 : 0,
                    }">
                        <GlobalHeatTooltip ref="heat-tooltip" class="tooltip" :data="hoveredPeriodData"
                            :width="tooltipWidth" :style="{
                                transform: `translate(${hoveredTooltipCoords.attach == 'right' ? '5' : '-105'
                                    }%, -50%)`,
                            }" />
                    </div>

                    <svg @mouseleave="onMouseLeave" @mousemove="onMouseMove" class="chart" :width="dimensions.width"
                        :height="dimensions.height">

                        <g :transform="`translate(${dimensions.marginLeft}, ${dimensions.marginTop})`">
                            <!-- <rect :fill="'url(#heat-path-gradient)'" :width="dimensions.boundedWidth"
                                :height="dimensions.boundedHeight"></rect> -->
                            <linearGradient x1="0" :y2="dimensions.marginTop" :y1="dimensions.boundedHeight" x2="0"
                                gradientUnits="userSpaceOnUse" id="heat-path-gradient">
                                <stop v-for="index in 10" :key="index" :stop-color="colorScale(index / 10)"
                                    :offset="`${index * 10}%`" />
                            </linearGradient>
                            <path :d="dataPath" :stroke="'url(#heat-path-gradient)'" fill="none" class="data-path" />
                            <!-- <g
                                v-for="bar in data"
                                :key="bar"
                                :style="{
                                    transform: `translate(${xBandScale(
                                        parseInt(bar.year)
                                    )}px, 0px)`,
                                }"
                            >
                                <rect
                                    :y="bar.mean < 0 ? yScale(0) : yScale(yAccessor(bar))"
                                    :width="barWidth"
                                    class="temp-rect"
                                    :height="Math.abs(yScale(bar.mean) - yScale(0))"
                                    :class="bar.mean < 0 ? 'temp-under' : 'temp-over'"
                                ></rect>
                            </g> -->
                            <g class="x-ticks" :style="{
                                transform: `translate(0, ${dimensions.boundedHeight + 20}px)`,
                            }">
                                <text class="tick-label" v-for="year in decadeTicks" :key="year"
                                    :x="xScale(new Date(year.toString()))" :style="{ transform: `translate(0, 10px)` }">
                                    {{ year }}
                                </text>
                            </g>
                            <g class="x-ticks">
                                <line v-for="rule in yTicks" :key="rule" :class="`x-rule x-rule-${rule}`"
                                    :y1="yScale(rule)" :y2="yScale(rule)" x1="0" :x2="dimensions.boundedWidth"
                                    stroke="black" />
                            </g>
                            <g class="y-tooltip" v-if="hoveredTooltipCoords.x">
                                <line :class="`y-rule y-rule-tooltip`" :x1="hoveredTooltipCoords.x"
                                    :x2="hoveredTooltipCoords.x" y1="0" :y2="dimensions.boundedHeight" stroke="black" />
                            </g>
                            <g class="y-ticks">
                                <line v-for="year in yearTicks" :key="year" :x1="xScale(new Date(year.toString()))"
                                    :x2="xScale(new Date(year.toString()))" :class="`y-rule y-rule-${year} ${year % 10 == 0 && 'y-rule-decade'
                                    }`" :y1="yOffset" :y2="dimensions.boundedHeight" stroke="black" />
                                <text class="x-tick-label" :x="xScale(new Date(middleYear.toString()))"
                                    :y="dimensions.boundedHeight + 40">
                                    Year
                                </text>
                            </g>
                            <g class="y-axis">
                                <line class="y-rule" y1="0" :y2="dimensions.boundedHeight" stroke="black" />
                                <text class="tick-label" v-for="tick in yTicks" :key="tick"
                                    :y="yScale(tick) + yOffset / 2" :x="-25"
                                    :style="{ transform: `translate(0, -10px)` }">
                                    {{ tick }}
                                </text>
                            </g>
                            <g :style="{
                                transform: `translate(-40px, ${yScale(0) - 4}px)`,
                            }">
                                <text class="y-tick-label" :x="0" :y="0"
                                    :style="{ transform: `translate(0, 0px) rotate(-90deg)` }">
                                    Mean (°C)
                                </text>
                            </g>
                        </g>
                    </svg>
                </template>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.global-heat-chart {
    height: 100%;
    width: 100%;
    height: 100%;
    //overflow: hidden;

    .metas {
        margin-bottom: 2em;

        h1,
        h2,
        h3 {
            margin: 0;
        }

        h3 {
            margin: 0.25em 0;
            margin-top: 0.7em;
            font-size: 1.15em;
            border-top: 1px solid var(--grey-300);
            padding-top: 1.25em;
        }

        .description {
            font-size: 0.8em;
            opacity: 0.6;
        }
    }

    .chart-top {
        width: 100%;
        display: flex;
        gap: 2em;
        justify-content: space-between;
    }

    .actions {
        display: none;

        .toggle {
            overflow: hidden;
            border-radius: 2px;
            background: var(--grey-200);
            border: 3px solid var(--grey-200);
            display: flex;
            max-width: fit-content;
            width: 100%;
            align-items: center;
        }

        .toggle-button {
            font-size: 0.75em;
            line-height: 1;
            letter-spacing: 0.055em;
            border-radius: 3px;
            background: var(--neon-green-300);
            border: 1px solid var(--neon-green-400);
            display: inline-flex;
            flex: 1;
            white-space: nowrap;
            border-radius: 2px;
            text-align: center;
            padding-left: 0.5em;
            padding-right: 0.5em;
            font-weight: 600;
            text-transform: uppercase;

            @media (max-width: 700px) {
                width: 100%;
            }

            .content {
                width: 100%;
                text-align: center;
            }

            &.inactive {
                background: transparent;
                color: var(--grey-600);
                border-color: transparent;
            }
        }

        label {
            color: var(--grey-600);
        }

        .inactive {
            background: var(--grey-300);
        }
    }

    .tooltip {
        position: absolute;
        transition: 10ms linear all;
    }

    .card {
        box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
        border: 1px solid var(--grey-200);
        border-radius: 4px;
        padding: 0.5em;
        width: 100%;
    }

    .card-metas {
        padding: 0 1.5rem;

        h3 {
            margin: 0;
            margin-bottom: 0.5em;
            font-size: 1.15em;
            padding-top: 1.25em;
        }

        .description {
            font-size: 0.8em;
            opacity: 0.6;
        }
    }

    .chart-container {
        width: 100%;
        height: 100%;
        height: 300px;
    }

    .chart {
        //max-height: 300px;

        .data-path {
            stroke-width: 2;
            transition: all 100ms linear;

            @media(min-width: 800px) {
                stroke-width: 3;
            }
        }

        .temp-rect {
            fill: royalblue;
            opacity: 0.2;
        }

        .temp-over {
            fill: red;
        }

        .x-rule {
            opacity: 0.1;
            stroke: #8898ac;

            &.x-rule-0 {
                opacity: 0.3;
            }
        }

        .y-rule {
            opacity: 0.05;
            stroke: #8898ac;

            &-decade {
                opacity: 0.15;
            }
        }

        .y-rule-tooltip {
            transition: 100ms linear all;
            opacity: 0.5;
        }

        .x-ticks {
            fill: #8898ac;

            .tick-label {
                font-size: 8px;
                text-anchor: middle;
            }
        }

        .y-tick-label {
            font-size: 0.7em;
            text-anchor: middle;
            fill: #8898ac;
        }

        .x-tick-label {
            font-size: 0.7em;
            text-anchor: middle;
            fill: #8898ac;
        }

        .y-axis {
            .tick-label {
                font-size: 8px;
                fill: #8898ac;
            }
        }
    }
}
</style>