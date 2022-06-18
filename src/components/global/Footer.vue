<script>
import { mapState } from "vuex";
export default {
    name: "Footer",
    components: {},
    props: {},
    data() {
        return {
            links: [
                {
                    label: "LinkedIn",
                    url: "https://www.linkedin.com/in/margueriteroth/",
                },
                {
                    label: "Instagram",
                    url: "https://instagram.com/marguer.ite/",
                },
                {
                    label: "Github",
                    url: "https://github.com/margueriteroth/",
                },
            ],
        };
    },
    computed: {
        ...mapState({
            infoDensity: state => state.infoDensity,
            themeColor: state => state.themeColor,
        }),
    },
    methods: {
        toggleInfoDensity() {
            let density = this.infoDensity == "low" ? "high" : "low";
            this.$store.dispatch("setInfoDensity", density);
        },
        toggleThemeColor() {
            let theme = this.themeColor == "light" ? "dark" : "light";
            this.$store.dispatch("setThemeColor", theme);
        },
    },
};
</script>

<template>
    <MaxWidth class="footer__container" size="xl">
        <MaxWidth size="m" class="footer">
            <div class="footer__left">
                <Link to="https://marguerite.io" do-open-in-new-tab alt="marguerite.io">
                <MargTitle size="xs" />
                </Link>
            </div>
            <div class="footer__right">
                <div class="repo">
                    <!-- <label>Github</label> -->
                    <div class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" class="gh-svg">
                            <path
                                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </div>
                    <Link do-open-in-new-tab to="https://github.com/margueriteroth/vue-d3-dataviz-starter">
                    margueriteroth/vue-d3-dataviz-starter
                    </Link>
                </div>
            </div>
        </MaxWidth>
    </MaxWidth>
</template>

<style lang="scss">
.footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    flex-wrap: wrap;

    &__container {
        position: relative;
        background: white;
    }

    &__left {
        width: 100%;
        border-top: 1px solid rgba(black, 0.2);
        padding-top: 2em;
        padding-bottom: 2em;
    }

    &__right {
        display: flex;
        width: 100%;
        gap: 2em;
        justify-content: flex-end;
        border-top: 1px solid rgba(black, 0.2);
        padding-top: 2em;
        padding-bottom: 2em;
        padding-left: 2em;

        .repo {
            display: flex;
            align-items: top;
            gap: 0.5em;
        }

        svg {
            width: 18px;
        }

        label {
            opacity: 0.5;
        }
    }

    p {
        font-size: 0.9rem;
        display: relative;

        &:first-of-type {
            margin-top: 0;
        }
    }
}
</style>
