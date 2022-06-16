<script>
export default {
    name: "GlobalHeatTooltip",
    props: {
        data: {
            type: Object,
            required: true,
        },
        width: {
            type: Number,
            default: 400,
        },
        scaledColor: {
            type: String,
            default: 'white'
        },
        attach: {
            type: String,
            default: 'right'
        }
    },
    data() {
        return {};
    },
    computed: {
        tempAdjective() {
            if (this.data.mean < 0) {
                return "cooler"
            } else if (this.data.mean > 0) {
                return "warmer"
            }
            return ""
        }
    },
    methods: {},
    watch: {},
    mounted() { },
};
</script>

<template>
    <div class="global-heat-tooltip" :style="{
        width: `${width}px`,
        borderLeft: `5px solid ${scaledColor}`,

    }">
        <div v-if="data?.year">
            <h4>{{ data.year }}</h4>
            <div class="description">{{ Math.abs(data.mean) }}°C {{ tempAdjective ? `${tempAdjective} than usual` : ''}}</div>
        </div>
    </div>
</template>

<style lang="scss">
.global-heat-tooltip {
    padding: 0.35em;
    padding-left: 0.75em;
    background: white;
    width: 100%;
    pointer-events: none;
    background: white;
    border-radius: 4px;
    box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px,
        rgba(0, 0, 0, 0.07) 0px 2px 4px,
        rgba(0, 0, 0, 0.07) 0px 4px 8px,
        rgba(0, 0, 0, 0.07) 0px 8px 16px,
        rgba(0, 0, 0, 0.07) 0px 16px 32px,
        rgba(0, 0, 0, 0.07) 0px 32px 64px;

    h4 {
        margin: 0;
    }

    .description {
        font-size: 0.8em;
        color: var(--grey-800);
    }
}
</style>
