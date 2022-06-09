<script>
    import utils from "@/scripts/utils.js";

    import {scaleLinear, scaleUtc, range, line, scan, max, min, timeFormat} from "d3";
    import {Delaunay} from "d3-delaunay";

    export default {
        name: "MassShootingPlot",
        props: {
            yAccessor: {
                type: Function,
                default: d => parseInt(d.age_of_shooter),
            },
            xAccessor: {
                type: Function,
                default: d => new Date(d.date.toString()),
            },
        },
        data() {
            return {
                isLoading: true,
                resizeObserver: null,

                localDataUrl: "src/data/mass-shooting-mother-jones.csv",

                data: [], // processed data

                youngAdultRange: {
                    // good ol "rent a car" age
                    start: 0,
                    end: 25,
                },
                decades: [0, 10, 20, 30, 40, 50, 60, 70],

                filters: {
                    summary: "school",
                },

                dimensions: {
                    marginTop: 20,
                    marginRight: 10,
                    marginBottom: 50,
                    marginLeft: 45,
                    boundedWidth: 0,
                    boundedHeight: 0,
                    height: 0,
                    width: 0,
                    axisOffset: 35,
                },
                xScale: scaleUtc(),
                yScale: scaleLinear(),

                dataPath: "",
                tooltipWidth: 260,
                tooltipHeight: 190,

                previousAttach: "right", // for fixing the flicker when sliding over
                hoveredTooltipCoords: {x: 0, y: 0},
                hoveredPeriodData: {},
                hoveredPeriodIndex: -1,

                isTooltipLocked: false,

                legend: ["Assailant", "Assailant with prior signs mental health issues"],

                voronoiData: {},

                calloutData: [
                    {age: 25, description: "Rent a car"},
                    {age: 21, description: "Drink legally"},
                ],
            };
        },
        computed: {
            maxYValue() {
                //return max(this.data, this.yAccessor);
                return 55;
            },
            minYValue() {
                //return min(this.data, this.yAccessor);
                return 0;
            },
            yearTicks() {
                return range(1982, 2024, 2);
            },
            yearLabels() {
                return range(1982, 2024, 8);
            },
            middleYear() {
                //from range above ^ in yearTicks
                return 1982 + (2020 - 1982) / 2;
            },
            ageTicks() {
                return range(0, 55, 15);
            },
            youngAdultCount() {
                let count = this.data.filter(row => {
                    let age = parseInt(row.age_of_shooter);
                    if (
                        age >= this.youngAdultRange.start &&
                        age <= this.youngAdultRange.end
                    ) {
                        return true;
                    }
                });
                return count.length;
            },
            maxVictimData() {
                let maxVictims = max(this.data, d => parseInt(d.total_victims));
                let maxFatalities = max(this.data, d => parseInt(d.fatalities));
                let maxInjured = max(this.data, d => parseInt(d.injured));
                return {maxVictims, maxFatalities, maxInjured};
            },
            countBy15() {
                let by15 = {};

                this.data.forEach(row => {
                    let age = parseInt(row.age_of_shooter);
                    let age15 = Math.floor(age / 15) * 15;

                    if (!by15[age15]) {
                        by15[age15] = [row];
                    } else {
                        by15[age15].push(row);
                    }
                });

                Object.keys(by15).forEach(decade => {
                    by15[decade] = by15[decade].sort((a, b) => {
                        return parseInt(a.age_of_shooter) - parseInt(b.age_of_shooter);
                    });
                });

                return by15;
            },
            priorSignCount() {
                let count = this.data.filter(row => this.didShowPriorSigns(row));
                return count.length;
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
                if (!data) return;
                let cleanData = [];
                data.forEach(row => {
                    let newDate = new Date(row.date);
                    row.date = newDate;
                    cleanData.push(row);

                    let cleanDataIndex = cleanData.length - 1;

                    Object.keys(this.filters).forEach(filter => {
                        // if filter is falsey, remove from clean data array

                        if (
                            filter == "weapons_obtained_legally" &&
                            !this.filters[filter] &&
                            row[filter] != "No"
                        ) {
                            cleanData.splice(cleanDataIndex, 1);
                        }

                        if (
                            filter == "summary" &&
                            this.filters[filter] &&
                            !row[filter].toLowerCase().includes(this.filters[filter])
                        ) {
                            cleanData.splice(cleanDataIndex, 1);
                        }
                    });
                });
                this.data = cleanData.sort((a, b) => {
                    return new Date(a.date) - new Date(b.date);
                });
            },
            setDimensions() {
                let box = this.$refs.container?.getBoundingClientRect();
                this.dimensions.width = box.width;
                this.dimensions.height = box.height;
                this.dimensions.boundedHeight =
                    box.height - this.dimensions.marginTop - this.dimensions.marginBottom;
                this.dimensions.boundedWidth =
                    box.width - this.dimensions.marginLeft - this.dimensions.marginRight;
                this.isLoading = false;
                this.setScales();
            },
            setScales() {
                if (!this.data[0]) {
                    return;
                }

                this.xScale = scaleUtc()
                    .domain([
                        new Date("1982"), // we want the beginning of the years instead of the exact start/end dates
                        new Date("2024"),
                    ])
                    .range([0, this.dimensions.boundedWidth]);
                this.yScale = scaleLinear()
                    .domain([this.maxYValue, this.minYValue - 0.25])
                    .range([0, this.dimensions.boundedHeight]);

                this.setVoronoiData();
            },
            setVoronoiData() {
                let dotCoords = this.data.map(row => {
                    let x = this.xScale(this.xAccessor(row));
                    let y = this.yScale(this.yAccessor(row));
                    return {
                        x,
                        y,
                    };
                });
                let delaunay = Delaunay.from(
                    dotCoords,
                    d => d.x,
                    d => d.y
                );
                let voronoi = delaunay.voronoi([
                    0,
                    0,
                    this.dimensions.boundedWidth,
                    this.dimensions.boundedHeight,
                ]);
                let voronoiPaths = dotCoords.map((d, i) => ({
                    d: voronoi.renderCell(i),
                    ...d,
                }));

                this.voronoiData = {dotCoords, voronoiPaths, voronoi};
            },
            changeActiveDataset(newSet) {
                if (!this.sources.includes(newSet)) {
                    return;
                }
                this.activeSource = newSet;
            },
            setTooltip(e) {
                if (!this.voronoiData.voronoiPaths) return;

                let mouseX = e.offsetX - this.dimensions.marginLeft; // left edge of the chart
                let mouseY = e.offsetY - this.dimensions.marginTop;


                let closestIndex = this.voronoiData.voronoi.delaunay.find(mouseX, mouseY);

                let {x, y} = {...this.voronoiData.dotCoords[closestIndex]};

                let attach = "right";
                if (this.tooltipWidth + x > this.dimensions.boundedWidth) {
                    attach = "left";
                }

                let halfTooltipHeight = this.tooltipHeight / 2;

                if (y + halfTooltipHeight > this.dimensions.boundedHeight) {
                    // restrict bottom bounds
                    y = y - ((y + halfTooltipHeight) - this.dimensions.boundedHeight);
                } else if (y - (halfTooltipHeight) < 0) {
                    // restrict top bounds
                    y = halfTooltipHeight;
                }



                this.hoveredTooltipCoords = {x, y, attach};
                this.hoveredPeriodData = this.data[closestIndex];
                this.hoveredPeriodIndex = closestIndex;
            },
            onMouseMove(e) {
                if (this.isTooltipLocked) {
                    return;
                }
                utils.debounce(this.setTooltip(e), 9000);
            },
            onMouseLeave(e) {
                if (this.isTooltipLocked) {
                    return;
                }

                this.hoveredTooltipCoords = {
                    x: 0,
                    y: 0,
                    attach: "right",
                    width: this.tooltipWidth,
                };
                this.hoveredPeriodData = {};
                this.hoveredPeriodIndex = -1;
            },
            lockTooltip() {
                this.isTooltipLocked = !this.isTooltipLocked;
            },
            getHumanDate(date) {
                let dateFormat = "%b %d, %Y";
                return timeFormat(dateFormat)(date);
            },
            didShowPriorSigns(shooter) {
                let value = shooter.prior_signs_mental_health_issues;
                if (value.toLowerCase() == "yes") {
                    return true;
                }
                return false;
            },
            didObtainLegally(shooter) {
                let value = shooter.weapons_obtained_legally;
                if (value.toLowerCase() == "yes") {
                    return true;
                }
                return false;
            },
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
            <h2>Majority of US Mass School Shooters Under 30 Years Old</h2>
            <h4>
                Aug 02, 1982 &ndash; May 24, 2022
            </h4>
            <div class="description">
                Source:
                <Link
                    to="https://www.motherjones.com/politics/2012/12/mass-shootings-mother-jones-full-data/"
                    do-open-in-new-tab
                >
                    Mother Jones
                </Link>
            </div>

        </div>

        <div v-if="isLoading">Loading data...</div>
        <div class="chart-container" ref="container">
            <template v-if="!isLoading">
                <div
                    class="tooltip-date-container"
                    :style="{
                        transform: `translate(${
                            hoveredTooltipCoords.x + dimensions.marginLeft
                        }px, ${dimensions.boundedHeight}px)`,
                        opacity: hoveredPeriodData.date ? 1 : 0,
                    }"
                >
                    <div class="date-label">
                        {{ getHumanDate(hoveredPeriodData.date) }}
                    </div>
                </div>
                <div
                    class="tooltip-container"
                    :style="{
                        transform: `translate(${
                            hoveredTooltipCoords.x + dimensions.marginLeft
                        }px, ${hoveredTooltipCoords.y + dimensions.marginTop}px)`,
                        opacity: hoveredPeriodData.date ? 1 : 0,
                    }"
                >
                    <MassShootingTooltip
                        :data="hoveredPeriodData"
                        :width="tooltipWidth"
                        :height="tooltipHeight"
                        :max-victim-data="maxVictimData"
                        :ref="'shootingTooltip'"
                        :class="{locked: isTooltipLocked}"
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
                    @click="lockTooltip"
                    class="chart"
                    :width="dimensions.width"
                    :height="dimensions.height"
                >
                    <g
                        class="x-rules"
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                        }"
                    >
                        <!-- <line
                            class="y-rule"
                            v-for="year in yearTicks"
                            :key="year"
                            :x1="xScale(new Date(year.toString()))"
                            :x2="xScale(new Date(year.toString()))"
                            :y2="dimensions.boundedHeight"
                            stroke="black"
                        /> -->
                        <line
                            class="y-rule"
                            v-for="year in yearLabels"
                            :key="year"
                            :x1="xScale(new Date(year.toString()))"
                            :x2="xScale(new Date(year.toString()))"
                            :y2="dimensions.boundedHeight"
                            stroke="black"
                        />
                    </g>
                    <!-- <g
                        class="age-highlight"
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${
                                yScale('25') + dimensions.marginTop
                            }px)`,
                        }"
                    >
                        <text>Age to rent a car: 25</text>
                        <line :x2="dimensions.boundedWidth" stroke="black"></line>
                    </g> -->
                    <g
                        class="y-axis"
                        :style="{
                            transform: `translate(${dimensions.marginLeft - 10}px, ${
                                dimensions.marginTop
                            }px)`,
                        }"
                    >
                        <text
                            class="tick-label"
                            v-for="(age, index) in ageTicks"
                            :key="age"
                            :y="yScale(age) + 3"
                        >
                            {{ index == ageTicks.length - 1 ? "Age" : "" }} {{ age }}
                        </text>
                        <g
                            :style="{
                                transform: `translate(-24px, ${yScale(30)}px)`,
                            }"
                        >
                            <!-- <text
                                class="axis-label"
                                :x="0"
                                :y="0"
                                :style="{transform: `translate(0, 0px) rotate(-90deg)`}"
                            >
                                Ages
                            </text> -->
                        </g>
                        <line
                            v-for="age in ageTicks"
                            :key="age"
                            class="age-tick"
                            :x1="10"
                            :x2="dimensions.boundedWidth + 10"
                            :y1="yScale(age.toString())"
                            :y2="yScale(age.toString())"
                            stroke="black"
                        ></line>
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
                            class="tick-label"
                            v-for="year in yearLabels"
                            :key="year"
                            :x="xScale(new Date(year.toString()))"
                            y="15"
                        >
                            {{ year }}
                        </text>
                        <text
                            class="axis-label"
                            :x="xScale(new Date(middleYear.toString()))"
                            :y="34"
                        >
                            Year
                        </text>
                    </g>
                    <g
                        class="highlight-30"
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${
                                dimensions.marginTop + yScale('30')
                            }px)`,
                        }"
                    >
                        <rect
                            :width="dimensions.boundedWidth"
                            :height="yScale('11') - yScale('30')"
                            :class="{highlight: hoveredPeriodData.age_of_shooter <= 30}"
                        ></rect>
                    </g>
                    <g
                        class="tooltip-elements"
                        v-if="hoveredTooltipCoords.x"
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                        }"
                    >
                        <line
                            class="y-tooltip-rule"
                            v-if="hoveredTooltipCoords.x"
                            :x1="hoveredTooltipCoords.x"
                            :x2="hoveredTooltipCoords.x"
                            :y2="dimensions.boundedHeight + 5"
                            stroke="black"
                            :opacity="isTooltipLocked ? 0.7 : 0.4"
                        />
                    </g>
                    <g
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                        }"
                        class="voronoi"
                        :opacity="0.03"
                        v-if="voronoiData?.voronoiPaths?.length"
                    >
                        <g v-for="path in voronoiData?.voronoiPaths" :key="path">
                            <path
                                stroke="black"
                                strokeWidth="1"
                                fill="transparent"
                                :d="path.d"
                            />
                        </g>
                    </g>
                    <g
                        class="data-plot"
                        v-if="!isLoading && this.data.length"
                        :transform="`translate(${dimensions.marginLeft}, ${dimensions.marginTop})`"
                    >
                        <g
                            class="shooter-container"
                            v-for="(shooter, index) in voronoiData.dotCoords"
                            :key="shooter"
                            :class="{hovered: hoveredPeriodIndex == index}"
                            :style="{
                                transform: `translate(${shooter.x}px, ${shooter.y}px)`,
                            }"
                        >
                            <g v-if="didShowPriorSigns(data[index])" class="prior-signs">
                                <circle r="4"></circle>
                                <circle
                                    class="dim"
                                    r="9"
                                    :class="{legal: didObtainLegally(data[index])}"
                                ></circle>
                            </g>
                            <g v-else>
                                <circle r="4"></circle>
                                <circle
                                    class="dim"
                                    r="9"
                                    :class="{legal: didObtainLegally(data[index])}"
                                ></circle>
                            </g>
                        </g>
                    </g>
                </svg>
            </template>
        </div>
        <div class="chart-legend">
            <div
                v-for="key in legend"
                :key="key"
                :class="`legend-key legend-key-${
                    key.toLowerCase().includes('prior') ? 'prior-signs' : ''
                }`"
            >
                <div class="icon">
                    <svg width="14" height="14">
                        <circle cx="7" cy="7" r="3"></circle>
                        <circle class="dim" cx="7" cy="7" r="7"></circle>
                    </svg>
                </div>
                <div>
                    {{ key }}
                </div>
            </div>
            <div class="total">
                {{data.length}}
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .mass-shooting-plot {
        height: 100%;
        width: 100%;
        overflow: hidden;
        //background: #383735;
        //padding: 1.3em;

        --royal-blue-700: #155da1;
        --forest-green-700: #25442e;
        --forest-green-500: #49875b;
        --forest-green-300: #a4c3ad;
        --forest-green-100: #dbe7de;
        --orange-500: #ff7102;

        --prior-signs-circles: black;
        --circles: var(--red-orange-800);

        h2 {
            line-height: 1.25;
        }

        .metas {
            margin-bottom: 0em;

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
                font-size: 0.8em;
            }

            @media (max-width: 600px) {
                font-size: 14px;
            }
        }

        .actions {
            display: flex;
            gap: 0.35em;

            .inactive {
                background: var(--grey-300);
            }
        }

        .tooltip-container {
        }

        .mass-shooting-tooltip {
            position: absolute;
            width: max-content;
            transition: 10ms linear all;
            z-index: 4000;
            transition: all 50ms linear;

            &.locked {
                box-shadow: 0 5px 10px 0px rgba(black, 0.35);
            }
        }

        .tooltip-date-container {
            position: absolute;

            .date-label {
                transform: translate(-50%, 107%);
                background: var(--red-orange-800);
                width: fit-content;
                color: white;
                font-size: 0.7em;
                font-weight: 600;
                padding: 0.135em 0.55em;
                border-radius: 1px;
            }
        }

        .chart-container {
            width: 100%;
            height: 100%;
            height: 330px;
            background: white;
            margin-top: 0.5em;
            border-radius: 3px;
        }

        .chart {
            height: 100%;
            max-height: 700px;

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
                    text-anchor: middle;
                }
            }

            .axis-label {
                font-size: 0.7em;
                text-anchor: end;
                opacity: 0.45;
            }

            .tick-label {
                font-size: 0.6em;
                text-anchor: middle;
            }

            .y-axis {
                .tick-label {
                    text-anchor: end;
                }
            }

            .age-tick {
                opacity: 0.1;
            }

            .y-tooltip-rule {
                transition: all 50ms linear;
            }

            .y-date-text {
                font-size: 0.8em;
            }

            .highlight-30 {
                rect {
                    fill: var(--red-orange-500);
                    opacity: 0.11;

                    // &.highlight {
                    //     opacity: 0.25;
                    // }
                }
            }

            .voronoi {
            }

            .shooter-container {
                .dim {
                    opacity: 0.2;
                }

                .prior-signs {
                    circle {
                        fill: var(--prior-signs-circles);
                    }
                }

                circle {
                    fill: var(--circles);
                }

                &.hovered {
                    circle {
                        opacity: 1;
                        fill: var(--red-orange-500);
                    }

                    .dim {
                        opacity: 0.3;
                        fill: var(--red-orange-800);
                    }
                }
            }
        }

        .chart-legend {
            display: flex;
            align-items: center;
            gap: 2em;
            font-size: 0.8em;

            .legend-key {
                display: flex;
                gap: 0.25em;
                align-items: end;

                .dim {
                    opacity: 0.2;
                }

                .icon {
                    transform: translateY(12.5%);
                }

                circle {
                    fill: var(--circles);
                }

                &-prior-signs {
                    circle {
                        fill: var(--prior-signs-circles);
                    }
                }
            }
        }
    }
</style>
