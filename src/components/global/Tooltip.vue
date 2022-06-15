<script>
export default {
    // website 3rd wall tooltip
    name: "Tooltip",
    components: {},
    props: {
        purpose: {
            type: String,
            validator(value) {
                return ["aside", "note", "blank"].includes(value);
            },
        },
        relativeToToggle: {
            type: Boolean, // false = use the teleport
            default: true,
        },
        position: {
            type: [Array, String],
            default: ["top", "center"], // does nuthin yet
        },
        gradient: {
            type: Boolean,
            default: false,
        },
        dots: {
            type: Boolean,
            default: false,
        },
        neon: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isLoaded: false,
            isHovered: false,
            isLocked: false,

            topOffset: 0,
            leftOffset: 0,
        };
    },
    computed: {
        classes() {
            return ["gradient", "dots", "neon"]
                .filter(prop => this[prop])
                .map(prop => `toggle-${prop}`)
                .toString()
                .replace(",", " ");
        },
    },
    methods: {
        toggleHover() {
            this.isHovered = !this.isHovered;
            console.log(this.isHovered)
            if (this.relativeToToggle && !this.isLocked) {
                return
            } else if (!this.isLocked) {
                this.setTooltipOffsets(this.isHovered);
            }
        },
        toggleTooltipLocked() {
            this.isHovered = true;
            this.isLocked = !this.isLocked;
        },
        setTooltipOffsets(isHovered) {
            if (isHovered) {
                let toggleRef = this.$refs["tooltip-toggle"];
                let tooltipContents = this.$refs["tooltip-contents"];

                this.topOffset =
                    toggleRef.getBoundingClientRect().top -
                    (toggleRef.getBoundingClientRect().height + 15);
                this.leftOffset =
                    toggleRef.getBoundingClientRect().left +
                    toggleRef.getBoundingClientRect().width / 2 -
                    tooltipContents.getBoundingClientRect().width / 2;
            } else {
                this.topOffset = 0;
                this.leftOffset = 0;
            }
        },
    },
    mounted() {
        this.isLoaded = true;
    },
};
</script>

<template>
    <div class="ui-tooltip">
        <div :class="`toggle ${classes}`" @mouseenter="toggleHover" @mouseleave="toggleHover"
            :style="{
                background: `${isLocked ? '#adff00' : ''}`
            }"
            @click="toggleTooltipLocked" ref="tooltip-toggle">
            <slot name="toggle" />
        </div>
        <template v-if="relativeToToggle">
            <div v-if="isLoaded && (isHovered || isLocked)" class="tooltip-container">
                <div ref="tooltip-contents" class="tooltip-contents" :style="{
                    transform: `translate(${0}%, ${-110}%)`,
                }">
                    <slot name="contents" />
                </div>
            </div>
        </template>

        <template v-else>
            <Teleport to="#tooltip-teleport" v-if="isLoaded">
                <div ref="tooltip-contents" class="tooltip-contents" :style="{
                    transform: `translate(${leftOffset}px, ${topOffset}px)`,
                    opacity: isHovered || isLocked ? 1 : 0,
                }">
                    <slot name="contents" />
                </div>
            </Teleport>
        </template>
    </div>
</template>

<style lang="scss">
.ui-tooltip {
    display: inline-block;
    position: relative;

    .toggle {
        display: inline-block;
        height: 100%;

        &:hover {
            cursor: pointer;
        }

        &.toggle-gradient {
            position: relative;

            &::before {
                position: absolute;
                content: "";
                bottom: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: linear-gradient(90deg, #ffdec9 0%, #fde8ef 100%);
                opacity: 1;
                z-index: -1;
            }
        }

        &.toggle-neon {
            text-decoration-line: underline;
            text-decoration-style: wavy;
            text-underline-offset: 2px;
            text-decoration-thickness: 2px;
            text-decoration-color: var(--neon-green-300);
        }
    }

    .tooltip-container {
        position: absolute;
        top: 0;
    }
}

.tooltip-contents {
    position: absolute;
    z-index: 10;
    background: var(--background-color);
    padding: 1em;
    background: white;
    width: 100%;
    background: white;
    border-radius: 4px;
    box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px,
        rgba(0, 0, 0, 0.07) 0px 2px 4px,
        rgba(0, 0, 0, 0.07) 0px 4px 8px,
        rgba(0, 0, 0, 0.07) 0px 8px 16px,
        rgba(0, 0, 0, 0.07) 0px 16px 32px,
        rgba(0, 0, 0, 0.07) 0px 32px 64px;

    p {
        margin-top: 0;
    }
}
</style>
