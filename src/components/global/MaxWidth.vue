<script>
    export default {
        name: "MaxWidth",
        components: {},
        props: {
            size: {
                type: String,
                default: "l",
            },
        },
        data() {
            return {

            };
        },
        computed: {

        },
        methods: {},
        mounted() {

        },
    };
</script>

<template>
    <div class="MaxWidth" :class="`MaxWidth--size-${size}`">
        <slot />
    </div>
</template>

<style lang="scss">
    $padding-horiz: 2rem;

    .MaxWidth {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 $padding-horiz;
        width: 100%;

        &--size {
            &-xs {
                max-width: 800px;
            }

            &-s {
                max-width: 1000px;
            }

            &-m {
                max-width: $max-width-m;
            }

            &-l {
                width: 100%;
                max-width: 100%;
                padding-left: 1.5rem;
                padding-right: 1.5rem;
            }

            &-xl {
                width: 100%;
                max-width: 100%;
                padding-left: 0;
                padding-right: 0;
            }
        }
    }
</style>
