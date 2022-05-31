<script>

    export default {
        name: "Nav",
        components: {},
        props: {},
        data() {
            return {};
        },
        computed: {
        }

    };
</script>

<template>
    <MaxWidth size="m" class="nav">
        <div>
            vue-d3-dataviz-starter
        </div>
    </MaxWidth>
</template>

<style lang="scss">
    .nav {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-weight: 600;
        transition: all 100ms linear;
        padding-top: 1em;
        padding-bottom: 1em;

        &__left {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }

        &__right {
            padding-top: 1.5rem;
            padding-bottom: 1rem;
            flex-wrap: wrap;
            display: flex;
            justify-content: flex-end;
            gap: 2.5em;
            padding-left: 1em;
            align-items: center;
            text-transform: capitalize;

            a {
                text-decoration: none;
            }
        }
    }
</style>
