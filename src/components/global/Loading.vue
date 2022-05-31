<script>
    export default {
        name: "Loading",
        components: {},
        props: {},
        data() {
            return {};
        },
        computed: {
            slots() {
                return Object.keys(this.$slots);
            }
        },
    };
</script>

<template>
    <div class="Loading">
        <slot />
        <div v-if="!slots.length">
            Loading...
        </div>
    </div>
</template>

<style lang="scss">
    .Loading {
        font-family: freight-text-pro, serif;
        font-size: 2em;
        font-style: italic;
        font-weight: 500;
        text-align: center;
    }
</style>
