<script>
    export default {
        name: "Layout",
        components: {},
        data() {
            return {};
        },
        computed: {},

        methods: {},
    };
</script>


<template>
    <div class="layout" id="layout">
        <div class="flex-content">
            <Nav />
            <slot />
        </div>
        <Footer />
    </div>
</template>


<style lang="scss">
    @import "./../styles/globals";

    .layout {
        display: flex;
        flex-direction: column;
        min-height: 100%;

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            height: 80px;
        }

        .flex-content {
            flex: 1;
        }

        .nav__link {
            margin-left: 20px;
        }
    }
</style>
