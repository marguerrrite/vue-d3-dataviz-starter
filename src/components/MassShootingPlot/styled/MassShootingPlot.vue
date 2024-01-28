<script>
    import utils from "@/scripts/utils.js";
    import {
        scaleLinear,
        scaleUtc,
        range,
        max,
        timeFormat,
        interpolateCool,
    } from "d3";
    import {Delaunay} from "d3-delaunay";
    import Tooltip from "../../global/Tooltip.vue";

    export default {
        name: "MassShootingPlot",
        components: {Tooltip},
        props: {
            yAccessor: {
                type: Function,
                default: d => parseInt(d.age_of_shooter),
            },
            xAccessor: {
                type: Function,
                default: d => new Date(d.date.toString()),
            },
            title: {
                type: String,
                default: "",
            },
        },
        data() {
            return {
                isLoading: true,
                resizeObserver: null,
                localDataUrl: "./data/mass-shooting-mother-jones.csv",
                data: [],
                youngAdultRange: {
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
                tooltipWidth: 350,
                tooltipHeight: 240,
                previousAttach: "right",
                hoveredTooltipCoords: {x: 0, y: 0},
                hoveredPeriodData: {},
                hoveredPeriodIndex: -1,
                isTooltipLocked: false,
                voronoiData: {},
                activeCalloutAge: 25,
                activeCalloutAgeLabel: "",
                calloutAges: [
                    {age: 25, description: "Rented a car", emoji: "🚙"},
                    {age: 21, description: "Drank alcohol", emoji: "🍺"},
                    {age: 18, description: "Smoked cigarettes", emoji: "🚬"},
                ],
                calloutTragedies: [
                    {case: "Columbine High School massacre", date: "", age: ""},
                    {
                        case: "Uvalde Robb Elementary School massacre",
                        date: "",
                        age: "",
                    }, // recent
                ],
                activeHighlight: "age",
                fatalityThreshold: 10,
            };
        },
        computed: {
            maxYValue() {
                return 55;
            },
            minYValue() {
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
            colorRange() {
                return [interpolateCool(0.2), interpolateCool(0.8)];
            },
            medianAge() {
                let ages = this.data.map(row => parseInt(row.age_of_shooter));

                ages.push(18); // Two Columbine shooters

                ages = ages.sort();
                let midIndex = Math.floor(ages.length / 2);
                return ages.length % 2 !== 0
                    ? ages[midIndex]
                    : (ages[midIndex - 1] + ages[midIndex]) / 2;
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
                        return (
                            parseInt(a.age_of_shooter) -
                            parseInt(b.age_of_shooter)
                        );
                    });
                });
                return by15;
            },
            priorSignCount() {
                let count = this.data.filter(row =>
                    this.didShowPriorSigns(row)
                );
                return count.length;
            },
            dropdownSrc() {
                let values = [...this.calloutAges];
                let list = values.map(d => {
                    return {
                        label: d.description,
                        value: d.age,
                    };
                });
                return list;
            },
            fatalities() {
                return this.data.reduce(
                    (sum, row) => sum + parseInt(row.fatalities),
                    0
                );
            },
            totalShooters() {
                return this.data.length + 1; // Two Columbine shooters
            },
        },
        methods: {
            async loadData() {
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
                if (!data) return;
                let cleanData = [];
                data.forEach(row => {
                    let newDate = new Date(row.date);
                    row.date = newDate;
                    row.callout = false;
                    this.calloutTragedies.forEach((tragedy, i) => {
                        let caseKeyword = tragedy.case
                            .split(" ")[0]
                            .toLowerCase();
                        if (
                            row.case.toLowerCase().includes(caseKeyword) ||
                            row.city.toLowerCase().includes(caseKeyword)
                        ) {
                            row.callout = true;
                            this.calloutTragedies[i] = row; // replace
                        }
                    });
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
                            !row[filter]
                                .toLowerCase()
                                .includes(this.filters[filter])
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
                    box.height -
                    this.dimensions.marginTop -
                    this.dimensions.marginBottom;
                this.dimensions.boundedWidth =
                    box.width -
                    this.dimensions.marginLeft -
                    this.dimensions.marginRight;
                this.isLoading = false;
                this.setScales();
            },
            setScales() {
                if (!this.data[0]) {
                    return;
                }
                this.xScale = scaleUtc()
                    .domain([new Date("1982"), new Date("2024")])
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
                let closestIndex = this.voronoiData.voronoi.delaunay.find(
                    mouseX,
                    mouseY
                );
                let {x, y} = {...this.voronoiData.dotCoords[closestIndex]};
                let attach = "right";
                if (this.tooltipWidth + x > this.dimensions.boundedWidth) {
                    attach = "left";
                }
                let halfTooltipHeight = this.tooltipHeight / 2;
                if (y + halfTooltipHeight > this.dimensions.boundedHeight) {
                    // restrict bottom bounds
                    y =
                        y -
                        (y + halfTooltipHeight - this.dimensions.boundedHeight);
                } else if (y - halfTooltipHeight < 0) {
                    // restrict top bounds
                    y = halfTooltipHeight;
                }
                // // small widths
                // if (this.tooltipWidth == 260 && this.tooltipWidth > x) {
                //     this.tooltipWidth = x - 10;
                // } else if (x + this.tooltipWidth > this.boundedWidth) {
                //     this.tooltipWidth = this.boundedWidth - x;
                // } else {
                //     this.tooltipWidth = 260;
                // }
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
            changeCalloutAge(newAge) {
                this.activeCalloutAge = newAge;
                this.activeCalloutAgeLabel = this.dropdownSrc.find(
                    d => d.value == newAge
                ).label;
            },
            getAgeCount(age) {
                // for age & under
                let ages = this.data.map(row => parseInt(row.age_of_shooter));
                ages.push(18); // Two Columbine shooters

                let count = ages.filter(row => {
                    if (row < age) {
                        return true;
                    }
                });

                return count.length;
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
            if (!this.activeCalloutAgeLabel) {
                // init the default label
                this.activeCalloutAgeLabel = this.dropdownSrc.find(
                    d => d.value == this.activeCalloutAge
                ).label;
            }

            await this.loadData();
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
        <!-- I would normally break this out into a few components (you should!), 
        but for scope and understanding, here is the whole kit and kaboodle. -->
        <div class="metas">
            <div class="title-container">
                <h2 class="title">{{ title }}</h2>
            </div>
        </div>

        <div v-if="isLoading">Loading data...</div>
        <div class="card">
            <div class="card-metas">
                <h3>
                    Evaluating Mass School Shooter Ages<Tooltip>
                        <template #toggle>*</template>
                        <template #contents
                            ><p>
                                For tragedies resulting in at least one death.
                            </p>
                        </template>
                    </Tooltip>
                </h3>

                <h3 class="secondary">USA, 1982 – 2022</h3>
                <div class="chart-legend">
                    <div class="col">
                        <div class="count">
                            {{ fatalities }}
                        </div>
                        <div class="label-container">
                            <div class="label">Total fatalities</div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="count">
                            {{ totalShooters }}
                        </div>
                        <div class="label-container">
                            <div class="label">Total shooters</div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="count">
                            {{ medianAge ? `${medianAge}` : "--" }}
                            <span>years old</span>
                        </div>
                        <div class="label-container">
                            <div class="label">Median shooter age</div>
                        </div>
                    </div>
                    <div class="col action-col">
                        <div class="count">
                            <div
                                class="filtered-count"
                                :style="{color: colorRange[0]}"
                            >
                                {{ getAgeCount(activeCalloutAge) }}&nbsp;
                            </div>
                            <span>of {{ totalShooters }} assailants</span>
                        </div>
                        <div class="label-container">
                            <div class="label">
                                <span>could not have legally</span>
                                <Dropdown
                                    class="age-threshold-dropdown"
                                    :items="dropdownSrc"
                                    :value="activeCalloutAgeLabel"
                                    @selected="changeCalloutAge"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="chart-container" ref="container">
                <template v-if="!isLoading">
                    <div
                        v-if="hoveredPeriodIndex > -1"
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
                        v-if="hoveredPeriodIndex > -1"
                        class="tooltip-container"
                        :style="{
                            transform: `translate(${
                                hoveredTooltipCoords.x + dimensions.marginLeft
                            }px, ${
                                hoveredTooltipCoords.y + dimensions.marginTop
                            }px)`,
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
                            :no-pointer-events="!isTooltipLocked"
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
                        <g
                            class="y-axis"
                            :style="{
                                transform: `translate(${
                                    dimensions.marginLeft - 10
                                }px, ${dimensions.marginTop}px)`,
                            }"
                        >
                            <text
                                class="tick-label"
                                v-for="(age, index) in ageTicks"
                                :key="age"
                                :y="yScale(age) + 3"
                            >
                                {{ index == ageTicks.length - 1 ? "Age" : "" }}
                                {{ age }}
                            </text>
                            <g
                                :style="{
                                    transform: `translate(-24px, ${yScale(
                                        30
                                    )}px)`,
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
                                transform: `translate(${
                                    dimensions.marginLeft
                                }px, ${
                                    dimensions.marginTop +
                                    dimensions.boundedHeight
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
                            class="callout-ages"
                            :style="{
                                transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                            }"
                        >
                            <rect
                                :y="0"
                                :width="dimensions.boundedWidth"
                                :height="yScale(activeCalloutAge)"
                                :class="{}"
                            ></rect>
                            <text
                                class="callout-label"
                                :x="5"
                                :y="34"
                                :style="{
                                    transform: `translate(0px, ${
                                        yScale(activeCalloutAge) - 16
                                    }px)`,
                                }"
                            >
                                Age {{ activeCalloutAge }}
                            </text>
                            <line
                                x1="0"
                                :x2="dimensions.boundedWidth"
                                :style="{
                                    transform: `translate(0px, ${yScale(
                                        activeCalloutAge
                                    )}px)`,
                                }"
                            ></line>
                            <!-- Using a transform here for setting the line Y allows us to animate the transition via css -->
                        </g>
                        <g
                            v-if="!isLoading"
                            class="callout-tragedy-container"
                            :style="{
                                transform: `translate(${dimensions.marginLeft}px, ${dimensions.marginTop}px)`,
                                opacity: hoveredTooltipCoords.x ? 0.15 : 0.45,
                            }"
                        >
                            <!-- Columbine -->
                            <line
                                :x1="xScale(xAccessor(calloutTragedies[0]))"
                                :y1="
                                    yScale(yAccessor(calloutTragedies[0])) -
                                    dimensions.boundedHeight / 3.7 +
                                    6
                                "
                                :x2="xScale(xAccessor(calloutTragedies[0]))"
                                :y2="yScale(yAccessor(calloutTragedies[0]))"
                                class="callout-rule"
                                stroke="black"
                            ></line>
                            <text
                                :x="xScale(xAccessor(calloutTragedies[0]))"
                                :y="
                                    yScale(yAccessor(calloutTragedies[0])) -
                                    dimensions.boundedHeight / 3.7
                                "
                                class="callout-label recent"
                            >
                                Columbine
                            </text>
                            <!-- Uvalde -->
                            <line
                                :x1="
                                    xScale(xAccessor(calloutTragedies[1])) -
                                    dimensions.boundedWidth / 50
                                "
                                :y1="
                                    yScale(yAccessor(calloutTragedies[1])) -
                                    dimensions.boundedHeight / 4 +
                                    6
                                "
                                :x2="xScale(xAccessor(calloutTragedies[1]))"
                                :y2="yScale(yAccessor(calloutTragedies[1]))"
                                class="callout-rule"
                                stroke="black"
                            ></line>
                            <text
                                :x="
                                    xScale(xAccessor(calloutTragedies[1])) -
                                    dimensions.boundedWidth / 50
                                "
                                :y="
                                    yScale(yAccessor(calloutTragedies[1])) -
                                    dimensions.boundedHeight / 4
                                "
                                class="callout-label recent"
                            >
                                Uvalde
                            </text>
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
                            :opacity="0.3"
                            v-if="voronoiData?.voronoiPaths?.length"
                        >
                            <g
                                v-for="path in voronoiData?.voronoiPaths"
                                :key="path"
                            >
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
                                v-for="(
                                    shooter, index
                                ) in voronoiData.dotCoords"
                                :key="shooter"
                                :class="{hovered: hoveredPeriodIndex == index}"
                                :style="{
                                    transform: `translate(${shooter.x}px, ${shooter.y}px)`,
                                }"
                            >
                                <g>
                                    <circle
                                        :fill="
                                            activeCalloutAge >=
                                            parseInt(data[index].age_of_shooter)
                                                ? colorRange[0]
                                                : '#5c647a'
                                        "
                                        :r="
                                            activeCalloutAge >=
                                            parseInt(data[index].age_of_shooter)
                                                ? 4
                                                : 4
                                        "
                                    ></circle>
                                    <circle
                                        v-if="
                                            data[index].fatalities >=
                                            fatalityThreshold
                                        "
                                        :fill="
                                            activeCalloutAge >=
                                            parseInt(data[index].age_of_shooter)
                                                ? colorRange[0]
                                                : '#5c647a'
                                        "
                                        class="dim"
                                        r="7"
                                    ></circle>
                                    <circle
                                        v-if="didShowPriorSigns(data[index])"
                                        :stroke="
                                            activeCalloutAge >=
                                            parseInt(data[index].age_of_shooter)
                                                ? 'cornflowerblue'
                                                : '#5c647a'
                                        "
                                        stroke-width="2"
                                        class="dim"
                                        fill="none"
                                        r="7"
                                    ></circle>
                                </g>
                            </g>
                        </g>
                    </svg>
                </template>
            </div>
            <div class="legend">
                <div class="col">
                    <div class="icon icon-fatalities"></div>
                    <div class="label">10+ fatalities</div>
                </div>
                <div class="col">
                    <div class="icon icon-warning"></div>
                    <div class="label">Displayed violent warning signs</div>
                </div>
            </div>
            <div class="sources">
                <div class="description">
                    Data period: Aug 02, 1982 &ndash; July 17, 2022 &nbsp;
                    &nbsp; &nbsp; Source:
                    <Link
                        to="https://www.motherjones.com/politics/2012/12/mass-shootings-mother-jones-full-data/"
                        do-open-in-new-tab
                    >
                        Mother Jones
                    </Link>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .mass-shooting-plot {
        height: 100%;
        width: 100%;
        //background: #383735;
        background: var(--red-orange-400);

        --royal-blue-700: #155da1;
        --forest-green-700: #25442e;
        --forest-green-500: #49875b;
        --forest-green-300: #a4c3ad;
        --forest-green-100: #dbe7de;
        --orange-500: #ff7102;

        --prior-signs-circles: var(--red-orange-800);
        --circles: rgba(black, 0.5);

        .metas {
            margin-bottom: 1rem;

            .row {
                display: flex;
                width: 100%;
                align-items: baseline;
                gap: 1em;
            }

            h1,
            h2,
            h3 {
                margin: 0;
            }

            h3 {
                margin: 0.25em 0;
                margin-top: 0.7em;
                font-size: 1.15em;
                padding-top: 1.25em;
            }

            .description {
                font-size: 0.8em;
                opacity: 0.6;
            }

            @media (max-width: 600px) {
                font-size: 14px;
            }
        }

        .title-container {
            .title {
            }
        }

        .actions {
            display: flex;
            gap: 0.35em;

            .inactive {
                background: var(--grey-300);
            }
        }

        .mass-shooting-tooltip {
            position: absolute;
            width: max-content;
            z-index: 4000;
            transition: all 10ms linear;

            &.locked {
                box-shadow: 0 5px 10px 0px rgba(black, 0.35);
            }
        }

        .tooltip-date-container {
            position: absolute;

            .date-label {
                transform: translate(-50%, 107%);
                background: #4c6edb;
                width: fit-content;
                color: white;
                font-size: 0.7em;
                font-weight: 600;
                padding: 0.135em 0.55em;
                border-radius: 1px;
            }
        }

        .card {
            box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
            border: 1px solid var(--grey-200);
            border-radius: 4px;
            padding: 0.5em;
            padding-top: 0;
            width: 100%;
            height: 100%;
        }

        .card-metas {
            padding: 0 1.5rem;

            h3 {
                margin: 0;
                font-size: 1.15em;
                padding-top: 1.25em;

                &.secondary {
                    margin: 0;
                    padding: 0;
                    opacity: 0.35;
                }
            }

            .Tooltip-contents {
                font-size: 0.8rem;
                padding: 0.85em;

                p {
                    margin: 0;
                }
            }
        }

        .chart-container {
            width: 100%;
            height: 100%;
            height: 330px;
            background: white;
            margin-top: 0.5em;
            border-radius: 3px;
            overflow: hidden;
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
                    font-size: 0.6em;
                }
            }

            .axis-label {
                font-size: 0.7em;
                text-anchor: end;
                opacity: 0.45;
            }

            .tick-label {
                text-anchor: middle;
            }

            .y-axis {
                .tick-label {
                    text-anchor: end;
                    font-weight: 600;
                    font-size: 0.7em;
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

            .callout-ages {
                rect {
                    fill: var(--grey-600);
                    opacity: 0.07;
                    transition: all 100ms linear;
                }

                line {
                    opacity: 0.5;
                    stroke: black;
                    stroke-dasharray: 4;
                    transition: all 100ms linear;
                }

                .callout-label {
                    font-size: 0.7em;
                    transition: all 100ms linear;
                }
            }

            .callout-tragedy-container {
                font-size: 0.85em;

                .callout-label {
                    opacity: 0.9;
                    text-anchor: middle;
                    font-weight: 600;
                    letter-spacing: -0.06em;
                    font-variant-numeric: tabular-nums;
                }

                .callout-rule {
                    stroke-dasharray: 2;
                    opacity: 0.4;
                }
            }

            .voronoi {
                opacity: 0;
            }

            .shooter-container {
                .dim {
                    opacity: 0.35;
                }

                .prior-signs {
                    circle {
                    }
                }

                circle {
                }

                &.hovered {
                    circle {
                        opacity: 1;
                        fill: var(--neon-pink-500);
                        stroke: var(--neon-pink-500);
                    }

                    .dim {
                        opacity: 0.5;
                    }
                }
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

        .chart-legend {
            display: flex;
            //align-items: center;
            gap: 1em;
            padding-top: 0.5em;
            margin-top: 1em;
            justify-content: space-around;

            @media (max-width: 600px) {
                display: grid;
                grid-template-columns: 1fr 1fr;
            }

            .col {
                width: 100%;
                // display: flex;
                // justify-content: space-between;
                // width: 100%;
            }

            .action-col {
                max-width: 9em;
                width: 100%;
                justify-content: center;
                align-items: center;
                display: flex;
                flex-direction: column;
                margin: 0 auto;
                //border: 1px solid;

                .label {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5em;
                }
            }

            .count {
                font-size: 1.2em;
                font-weight: 600;
                width: 100%;
                //padding-left: 1.1rem;
                text-align: center;

                .filtered-count {
                    display: inline-block;
                    font-weight: 700;
                }

                span {
                    font-size: 0.8rem;
                    font-weight: 500;
                    opacity: 0.5;
                }
            }

            .label-container {
                display: flex;
                align-items: baseline;
                width: 100%;
                gap: 0.25em;
                //max-width: 134px;
                //width: fit-content;
                justify-content: center;
                text-align: right;
                text-align: center;

                .label {
                    text-align: center;
                    width: 100%;
                }
            }

            .age-threshold-dropdown {
                display: inline-flex;
                min-width: fit-content;

                .value {
                    text-transform: lowercase;
                    white-space: nowrap;
                }

                .options .button {
                    font-size: 1em;
                    text-transform: lowercase;
                }
            }

            .label {
                font-size: 0.8em;
                line-height: 1.2;
            }
        }
        .legend {
            display: flex;
            gap: 1em;
            margin-bottom: 1em;
            padding-left: 1.5em;

            .col {
                display: flex;
                gap: 0.5em;
                font-size: 0.8rem;
                align-items: center;
            }

            .icon {
                width: 16px;
                height: 16px;
                border-radius: 16px;
                background: lightgrey;
                border: 2px solid lightgrey;
                position: relative;

                &:after {
                    position: absolute;
                    content: "";
                    top: 2px;
                    left: 2px;
                    width: 8px;
                    height: 8px;
                    background: rgb(92, 100, 122);
                    border-radius: 10px;
                }

                &-warning {
                    background: transparent;
                }
            }
        }
    }
</style>
