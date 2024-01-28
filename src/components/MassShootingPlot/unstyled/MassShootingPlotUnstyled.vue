<script>
    import utils from "@/scripts/utils.js";

    import {scaleLinear, scaleUtc, range, line, scan, max, min, timeFormat} from "d3";
    import {Delaunay} from "d3-delaunay";

    export default {
        name: "MassShootingPlotUnstyled",
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

                localDataUrl: "./data/mass-shooting-mother-jones.csv",

                data: [], // processed data

                youngAdultRange: {
                    // good ol "rent a car" age
                    start: 0,
                    end: 25,
                },
                decades: [0, 10, 20, 30, 40, 50, 60, 70],

                dimensions: {
                    marginTop: 0,
                    marginRight: 10,
                    marginBottom: 40,
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

                voronoiData: {},
            };
        },
        computed: {
            maxYValue() {
                //return max(this.data, this.yAccessor);
                return 76;
            },
            minYValue() {
                //return min(this.data, this.yAccessor);
                return 0;
            },
            yearTicks() {
                return range(1982, 2024, 4);
            },
            middleYear() {
                //from range above ^ in yearTicks
                return 1982 + (2020 - 1982) / 2;
            },
            ageTicks() {
                return range(0, 76, 10);
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
            countByDecade() {
                let byDecade = {};

                this.data.forEach(row => {
                    let age = parseInt(row.age_of_shooter);
                    let ageDecade = Math.floor(age / 10) * 10;

                    if (!byDecade[ageDecade]) {
                        byDecade[ageDecade] = [row];
                    } else {
                        byDecade[ageDecade].push(row);
                    }
                });

                Object.keys(byDecade).forEach(decade => {
                    byDecade[decade] = byDecade[decade].sort((a, b) => {
                        return parseInt(a.age_of_shooter) - parseInt(b.age_of_shooter);
                    });
                });

                return byDecade;
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
                let cleanData = [];
                data.forEach(row => {
                    let newDate = new Date(row.date);
                    row.date = newDate;
                    cleanData.push(row);
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

                this.hoveredTooltipCoords = {x, y, attach};
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
    <div class="mass-shooting-plot-unstyled">
        <div class="metas">
            <h2>Ages of US Mass Shooters Over Time, 1982 &ndash; 2022</h2>
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
                    class="chart-tooltip"
                    :style="{
                        transform: `translate(${
                            hoveredTooltipCoords.x + dimensions.marginLeft
                        }px, ${hoveredTooltipCoords.y}px)`,
                        opacity: hoveredPeriodData.date ? 1 : 0,
                        display: 'inline-block'
                    }"
                >
                    <MassShootingTooltipUnstyled
                        :data="hoveredPeriodData"
                        :width="tooltipWidth"
                        :style="{
                            transform: `translate(${
                                hoveredTooltipCoords.attach == 'right' ? '5' : '-105'
                            }%, 0%)`,
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
                    <!-- <rect
                        :opacity="0.26"
                        :width="dimensions.width"
                        :height="dimensions.height"
                    ></rect> -->
                    <g
                        class="axes"
                        :style="{
                            transform: `translate(0, ${dimensions.marginTop}px)`,
                        }"
                    ></g>
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
                        class="y-ticks"
                        :style="{
                            transform: `translate(${dimensions.marginLeft - 10}px, ${
                                dimensions.marginTop
                            }px)`,
                        }"
                    >
                        <text
                            class="y-tick-label"
                            v-for="age in ageTicks"
                            :key="age"
                            :y="yScale(age)"
                        >
                            {{ age }}
                        </text>
                        <g
                            :style="{
                                transform: `translate(-40px, ${yScale(38)}px)`,
                            }"
                        >
                            <text
                                class="y-tick-label"
                                :x="0"
                                :y="0"
                                :style="{transform: `translate(0, 0px) rotate(-90deg)`}"
                            >
                                Ages
                            </text>
                        </g>
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

                    <!-- <g
                        :style="{
                            transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                        }"
                        class="voronoi"
                        :opacity="0.075"
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
                    </g> -->
                    <g
                        class="data-plot"
                        :transform="`translate(${dimensions.marginLeft}, ${dimensions.marginTop})`"
                    >
                        <g
                            class="shooter-container"
                            v-for="(shooter, index) in voronoiData.dotCoords"
                            :key="shooter"
                            :style="{
                                transform: `translate(${shooter.x}px, ${shooter.y}px)`,
                                fill: `${hoveredPeriodIndex == index ? 'red' : 'black'}`,
                            }"
                        >
                            <circle r="4"></circle>
                        </g>
                    </g>
                </svg>
            </template>
        </div>
    </div>
</template>

<style lang="scss">
    .mass-shooting-plot-unstyled {
        height: 100%;
        width: 100%;
        overflow: hidden;

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
            }
        }

        .actions {
            display: flex;
            gap: 0.35em;

            .inactive {
                background: var(--grey-300);
            }
        }

        .chart-tooltip {
            position: absolute;
            transition: 10ms linear all;
        }

        .chart-container {
            width: 100%;
            height: 100%;
            height: 300px;
        }

        .chart {
            height: 100%;
            max-height: 400px;

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
                text-anchor: end;
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
