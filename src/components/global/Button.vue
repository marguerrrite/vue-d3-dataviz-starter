<script>
    export default {
        name: "Button",
        components: {},
        props: {
            size: {
                type: String,
                default: "m",
                validator(value) {
                    return ["xxs", "xs", "s", "m", "l", "xl", "xxl"].includes(value);
                },
            },
            noStyle: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {};
        },
        computed: {},
    };
</script>

<template>
    <button class="Button" :class="[`size-${size}`, noStyle ? 'no-style' : '']">
        <slot />
    </button>
</template>

<style lang="scss">
    .Button {
        display: inline-block;
        border: none;
        margin: 0;
        text-decoration: none;
        font-size: 1rem;
        line-height: 1;
        cursor: pointer;
        text-align: center;
        -webkit-appearance: none;
        -moz-appearance: none;

        font-weight: 600;
        background: var(--neon-green-300);

        &:hover {
            background: lightgrey;
        }

        &.no-style {
            display: inline-block;
            font-weight: 500;
            background: transparent;
            text-align: left;
        }

        &.size {
            &-xxs {
            }
            &-xs {
            }
            &-s {
                padding: 0.1em 0.35em;
            }
            &-m {
                padding: 0.3em 0.5em;
            }
            &-l {
            }
            &-xl {
            }
            &-xxl {
            }
        }
    }
</style>
