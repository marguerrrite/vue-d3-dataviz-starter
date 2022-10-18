<script>
    import utils from "@/scripts/utils.js";

    import {
        scaleLinear,
        scaleBand,
        scaleUtc,
        range,
        line,
        scan,
        curveCardinal,
        scaleSequential,
        interpolateRdYlBu,
    } from "d3";
    import Dropdown from "../../global/Dropdown.vue";

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

                localDataUrl: "./data/noaa-data.csv",
                data: [],
                filteredData: [],

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
                colorDataScale: scaleSequential(),

                birthValue: "1980s",
                period: {
                    start: 1980,
                    end: 2022,
                },
                tempSentiment: "yes",

                barWidth: 1,
                dataPath: "",

                colorRange: ["#F55951", "#F1E8E6", "#5577F5"],

                tooltipWidth: 180,
                hoveredTooltipCoords: {x: 0, y: 0},
                hoveredPeriodData: {},
                hoveredPeriodIndex: -1,

                yTicks: [-0.5, 0, 0.5],

                decadeTicks: [],
                yearTicks: [],
                middleYear: [],
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
            dropdownSrc() {
                let values = range(1920, 2030, 10);
                let list = values.map(d => {
                    return {
                        label: d + "s",
                        value: d,
                    };
                });

                list.push({
                    label: "--",
                    value: -1,
                });

                return list.reverse();
            },
        },
        methods: {
            loadData() {
                this.$papa.parse(this.localDataUrl, {
                    download: true,
                    header: true,
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
                this.data = processedData;
                this.filterData();
            },
            filterData() {
                let data = [...this.data];
                data = data.filter(
                    row =>
                        row.year >= this.period.start &&
                        row.year <= this.period.end
                );
                this.filteredData = data;
            },
            setDimensions() {
                let box = this.$refs.container?.getBoundingClientRect();
                this.dimensions.width = box.width;
                this.dimensions.height = box.height;
                this.dimensions.boundedHeight =
                    box.height -
                    this.dimensions.marginTop -
                    this.dimensions.marginBottom;
                this.dimensions.boundedWidth =
                    box.width -
                    this.dimensions.marginLeft -
                    this.dimensions.marginRight;
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
                    .range([0, this.dimensions.boundedHeight]);
                this.colorScale = scaleSequential(
                    colorLinearScale.domain(),
                    interpolateRdYlBu
                );
                this.colorDataScale = scaleSequential(
                    this.yScale.domain(),
                    interpolateRdYlBu
                );
                let barPadding = 1;
                this.barWidth = this.xBandScale.bandwidth() - barPadding;

                this.generateLine();
                this.setTicks();
                this.setTempSentiment();
            },
            generateLine() {
                let pathGenerator = () =>
                    line()
                        .x(d => this.xScale(new Date(d.year)))
                        .y(d => this.yScale(d.mean))
                        .curve(curveCardinal.tension(0.2));
                this.dataPath = pathGenerator()([...this.filteredData]);
                this.isLoading = false;
            },
            setTooltip(e) {
                let x = e.offsetX - this.dimensions.marginLeft; // left edge of the chart
                let y = e.offsetY;
                let hoveredDate = this.xScale.invert(x);
                let getDistanceFromHoveredDate = d => {
                    return Math.abs(
                        this.xScale(this.xAccessor(d)) -
                            this.xScale(hoveredDate)
                    );
                };
                let closestIndex = scan(this.data, (a, b) => {
                    return (
                        getDistanceFromHoveredDate(a) -
                        getDistanceFromHoveredDate(b)
                    );
                });
                let attach = "right";
                if (this.tooltipWidth + x > this.dimensions.boundedWidth) {
                    attach = "left";
                }
                this.hoveredTooltipCoords = {x, y, attach};
                this.hoveredPeriodData = this.data[closestIndex];
                this.hoveredPeriodIndex = closestIndex;
            },
            setTicks() {
                let decadeInterval = this.period.start > 1940 ? 10 : 20;
                this.decadeTicks = range(
                    this.period.start,
                    this.period.end,
                    decadeInterval
                );

                let yearInterval = this.period.start > 1990 ? 1 : 2;
                this.yearTicks = range(
                    this.period.start,
                    this.period.end,
                    yearInterval
                );

                this.middleYear =
                    this.period.start +
                    (this.period.end - this.period.start) / 2;
            },
            setTempSentiment() {
                let hasNegativeAnomalies = this.filteredData.filter(
                    d => d.mean < 0
                ).length;
                if (hasNegativeAnomalies) {
                    this.tempSentiment =
                        "No, but barely. You have experienced a rare, distant decade with cooler-than-normal temperatures.";
                } else {
                    this.tempSentiment =
                        "Yes — the world has always been abnormally hot during your lifetime.";
                }
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
            changePeriodStart(decade) {
                if (decade == -1) {
                    // reset to all
                    this.period.start = 1880;
                    this.birthValue = "--";
                } else {
                    this.period.start = decade;
                    this.birthValue = decade + "s";
                }
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
                    this.filterData();
                    this.setDimensions();
                },
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
        components: {Dropdown},
    };
</script>

<template>
    <div class="global-heat-chart">
        <div class="metas">
            <h2>We will always be in the hottest decade</h2>
        </div>

        <div v-if="isLoading">Loading data...</div>
        <div class="card">
            <div class="card-metas">
                <h3>Has the Earth always been this hot?</h3>
                <div class="birth-actions">
                    <div>When were you born?</div>
                    <Dropdown
                        class="birth-decade-dropdown"
                        :items="dropdownSrc"
                        :value="birthValue"
                        @selected="changePeriodStart"
                    />
                </div>
            </div>
            <div class="temperature-sentiment">
                <template v-if="this.birthValue != '--'">
                    {{ tempSentiment }}
                </template>
                <template v-else>
                    No, but it has been rising steadily since the beginning of
                    the 20th century and rising
                    <Tooltip neon>
                        <template #toggle
                            ><strong>twice as fast</strong></template
                        >
                        <template #contents>
                            <div>
                                <p>
                                    Earth’s temperature has risen by 0.14° F
                                    (0.08° C) per decade since 1880, and the
                                    rate of warming over the past 40 years is
                                    more than twice that: 0.32° F (0.18° C) per
                                    decade since 1981.
                                </p>
                                <Link
                                    do-open-in-new-tab
                                    to="https://www.climate.gov/news-features/understanding-climate/climate-change-global-temperature"
                                >
                                    - climage.gov
                                </Link>
                            </div>
                        </template>
                    </Tooltip>
                    the last 40 years.
                </template>
            </div>
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
                        <GlobalHeatTooltip
                            ref="heat-tooltip"
                            class="tooltip"
                            :data="hoveredPeriodData"
                            :attach="hoveredTooltipCoords.attach"
                            :scaled-color="
                                colorDataScale(hoveredPeriodData.mean)
                            "
                            :width="tooltipWidth"
                            :style="{
                                transform: `translate(${
                                    hoveredTooltipCoords.attach == 'right'
                                        ? '5'
                                        : '-105'
                                }%, -50%)`,
                            }"
                        />
                    </div>

                    <svg
                        class="chart"
                        :width="dimensions.width"
                        :height="dimensions.height"
                    >
                        <g
                            :transform="`translate(${dimensions.marginLeft}, ${dimensions.marginTop})`"
                            @mouseleave="onMouseLeave"
                            @mousemove="onMouseMove"
                        >
                            <rect
                                :fill="'transparent'"
                                :width="dimensions.boundedWidth"
                                :y="-yOffset"
                                :height="dimensions.boundedHeight + yOffset"
                            ></rect>
                            <linearGradient
                                x1="0"
                                :y2="dimensions.marginTop"
                                :y1="dimensions.boundedHeight"
                                x2="0"
                                gradientUnits="userSpaceOnUse"
                                id="heat-path-gradient"
                            >
                                <stop
                                    v-for="index in 10"
                                    :key="index"
                                    :stop-color="colorScale(index / 10)"
                                    :offset="`${index * 10}%`"
                                />
                            </linearGradient>
                            <path
                                :d="dataPath"
                                :stroke="'url(#heat-path-gradient)'"
                                fill="none"
                                class="data-path"
                            />
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
                            <g
                                class="x-ticks"
                                :style="{
                                    transform: `translate(0, ${
                                        dimensions.boundedHeight + 5
                                    }px)`,
                                }"
                            >
                                <text
                                    class="tick-label"
                                    v-for="year in decadeTicks"
                                    :key="year"
                                    :x="xScale(new Date(year.toString()))"
                                    :style="{transform: `translate(0, 10px)`}"
                                >
                                    {{ year }}
                                </text>
                            </g>
                            <g class="x-ticks">
                                <line
                                    v-for="rule in yTicks"
                                    :key="rule"
                                    :class="`x-rule x-rule-${rule}`"
                                    :y1="yScale(rule)"
                                    :y2="yScale(rule)"
                                    x1="0"
                                    :x2="dimensions.boundedWidth"
                                    stroke="black"
                                />
                            </g>
                            <g
                                class="chart-tooltip-elements"
                                v-if="hoveredTooltipCoords.x"
                            >
                                <line
                                    :class="`y-rule y-rule-tooltip`"
                                    :x1="
                                        xScale(
                                            new Date(
                                                hoveredPeriodData.year.toString()
                                            )
                                        )
                                    "
                                    :x2="
                                        xScale(
                                            new Date(
                                                hoveredPeriodData.year.toString()
                                            )
                                        )
                                    "
                                    y1="0"
                                    :y2="dimensions.boundedHeight"
                                    stroke="black"
                                />
                                <circle
                                    class="tooltip-ball"
                                    :fill="
                                        colorDataScale(hoveredPeriodData.mean)
                                    "
                                    :cx="
                                        xScale(
                                            new Date(
                                                hoveredPeriodData.year.toString()
                                            )
                                        )
                                    "
                                    :cy="yScale(hoveredPeriodData.mean)"
                                    r="4"
                                ></circle>
                                <!-- <line :class="`x-rule x-rule-tooltip`" x1="0"
                                    :x2="dimensions.boundedWidth" :y1="yScale(hoveredPeriodData.mean)" :y2="yScale(hoveredPeriodData.mean)" stroke="black" /> -->
                            </g>
                            <g class="y-ticks">
                                <line
                                    v-for="year in yearTicks"
                                    :key="year"
                                    :x1="xScale(new Date(year.toString()))"
                                    :x2="xScale(new Date(year.toString()))"
                                    :class="`y-rule y-rule-${year} ${
                                        year % 10 == 0 && 'y-rule-decade'
                                    }`"
                                    :y1="yOffset"
                                    :y2="dimensions.boundedHeight"
                                    stroke="black"
                                />
                                <text
                                    class="x-tick-label"
                                    :x="xScale(new Date(middleYear.toString()))"
                                    :y="dimensions.boundedHeight + 40"
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
                                    v-for="tick in yTicks"
                                    :key="tick"
                                    :y="yScale(tick) + yOffset / 2"
                                    :x="-20"
                                    :style="{transform: `translate(0, -10px)`}"
                                >
                                    {{ tick }}
                                </text>
                            </g>
                            <g
                                class="y-axis-title"
                                :style="{
                                    transform: `translate(-20px, ${yScale(
                                        0.7
                                    )}px)`,
                                }"
                            >
                                <text
                                    class="tick-label"
                                    :x="0"
                                    :y="0"
                                    :style="{transform: `translate(0, 0px)`}"
                                >
                                    Mean
                                </text>
                                <text
                                    class="tick-label"
                                    :x="0"
                                    :y="10"
                                    :style="{transform: `translate(0, 0px)`}"
                                >
                                    °C
                                </text>
                            </g>
                        </g>
                    </svg>
                </template>
            </div>
            <div class="sources">
                <div class="description">
                    Monthly Temperature Anomalies °C, 1880 &ndash; 2022 &nbsp;
                    &nbsp; &nbsp; Source:
                    <Link
                        to="https://www.ncdc.noaa.gov/cag/global/time-series"
                        do-open-in-new-tab
                    >
                        NOAA
                    </Link>
                </div>
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
            margin-bottom: 1rem;

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
            //height: 100%;
        }

        .card-metas {
            padding: 0 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;

            h3 {
                margin: 0;
                margin-bottom: 0.5em;
                font-size: 1.15em;
                padding-top: 1.25em;
            }
        }

        .sources {
            .description {
                padding: 0 1.5rem;
                font-size: 0.7em;
                opacity: 0.65;
                margin-bottom: 1em;
                text-align: right;
            }
        }

        .temperature-sentiment {
            padding: 0 1.5rem;
            min-height: 3em;
            height: 100%;
            max-width: 550px;
            margin-bottom: 1em;

            @media (max-width: 600px) {
                color: var(--grey-700);
            }

            strong {
                font-weight: 600;
            }

            .tooltip-contents {
                width: 400px;
                font-size: 0.95em;
            }
        }

        .birth-actions {
            display: flex;
            align-items: center;
            white-space: nowrap;
            gap: 0.5em;
            justify-content: center;
            font-size: 0.8em;
            position: relative;

            @media (max-width: 600px) {
                width: 100%;
            }

            @media (max-width: 500px) {
                font-size: 1em;
            }

            .dropdown {
                .options .button {
                    font-size: 1em;
                }
            }

            .filter-note {
                position: absolute;
                bottom: -30px;
                left: 50%;
            }
        }

        .chart-container {
            width: 100%;
            height: 100%;
            height: 300px;
            overflow: hidden;
        }

        .chart {
            //max-height: 300px;

            .data-path {
                stroke-width: 2;
                transition: all 100ms linear;

                @media (min-width: 800px) {
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

            .tooltip-ball {
                stroke: var(--plum-700);
            }

            .y-rule-tooltip {
                transition: 100ms linear all;
                opacity: 0.5;
            }

            .y-axis-title {
                .tick-label {
                    text-anchor: end;
                }
            }

            .tick-label {
                font-size: 8px;
                text-anchor: middle;
            }

            .x-ticks {
                fill: #8898ac;
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
                    font-size: 9px;
                    opacity: 0.5;
                    text-anchor: end;
                }
            }
        }
    }
</style>
