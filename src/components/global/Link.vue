<script>
    export default {
        name: "Link",
        components: {},
        props: {
            placeholder: {
                type: String,
                default: "search",
            },
            to: {
                type: String,
                required: true,
            },
            doOpenInNewTab: {
                type: Boolean,
                default: false,
            },
            isButton: {
                type: Boolean,
                default: false,
            },
            noDecoration: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {};
        },
        computed: {
            isExternal() {
                return !this.to.startsWith("/");
            },
        },
    };
</script>

<template>

    <a
        class="Link"
        :class="{'Link--no-decoration': noDecoration}"
        :href="to"
        :target="doOpenInNewTab ? '_blank' : ''"
        :rel="doOpenInNewTab ? 'noreferrer noopener' : ''"
    >
        <Button v-if=isButton>
            <slot />
        </Button>
        <slot v-else/>
    </a>
</template>

<style lang="scss">
    .Link {
        &__button {
            text-decoration: none;
        }

        &--no-decoration {
            text-decoration: none;
        }

        &:hover {
            cursor: pointer;
        }

        h2.link-content {
            text-decoration: underline;
            text-underline-offset: 2px;
            text-decoration-thickness: 2px;
        }
    }
</style>
