<script>
    export default {
        name: "GayAgenda",
        components: {},
        props: {
            purpose: {
                type: String,
                validator(value) {
                    return ["abortion"].includes(value);
                },
                default: "abortion",
            },
        },
        data() {
            return {
                isLoaded: false,
                abortion: [
                    {
                        url: "https://www.weareplannedparenthood.org/RpiDSnHxKkC3KSPoysldiQ2",
                        blurb: "Abortion is healthcare.",
                        cta: "Donate to Planned Parenthood now",
                    },
                    {
                        url: "https://www.aclu.org/",
                        blurb: `Reproductive rights are human rights.`,
                        cta: "Donate to the ACLU now",
                    },
                ],
            };
        },
        computed: {
            classes() {
                let classes = [];
                if (this.purpose.includes("abortion")) {
                    classes.push("abortion");
                    if (this.randomCta.blurb.toLowerCase().includes("abortion")) {
                        classes.push("planned-parenthood");
                    } else {
                        classes.push("aclu");
                    }
                }
                return classes;
            },
            randomCta() {
                return this.abortion[Math.floor(Math.random() * this.abortion.length)];
            },
        },
        methods: {},
        mounted() {
            this.isLoaded = true;
        },
    };
</script>

<template>
    <Link class="GayAgenda" :class="classes" :to="randomCta.url" do-open-in-new-tab>
        <div class="content">
            <div class="blurb">
                {{ randomCta.blurb }}
            </div>
            <div class="cta">
                {{ randomCta.cta }}
                <div
                    v-if="randomCta.blurb.toLowerCase().includes('abortion')"
                    class="planned-parenthood-logo"
                >
                    <svg width="214" height="214" viewBox="0 0 214 214" fill="none">
                        <rect width="214" height="214" />
                        <path
                            d="M178 143.355V73.8684H159.036V16H103.484C66.4494 16 37 45.9396 37 82.5821V201H55.9636V82.5821C55.9636 56.4408 77.1582 34.9915 103.484 34.9915H139.627V73.8684H110.4C86.7516 73.8684 67.3418 93.3068 67.3418 116.99V201H86.7516V116.99C86.7516 103.808 97.2373 93.0833 110.4 93.0833H159.036V143.355C159.036 156.537 148.104 167.039 134.941 167.039H99.6915L91.4367 186.03H134.941C158.813 186.03 178 167.039 178 143.355Z"
                            fill="white"
                        />
                    </svg>
                </div>
                <div v-else class="aclu-logo">
                    <svg width="214" height="214" viewBox="0 0 214 214" fill="none">
                        <path
                            d="M21.2172 72.728H51.2172L65.4203 140.852H46.2102L43.9535 128.882H27.7898L25.5331 140.852H7L21.2172 72.728ZM30.6248 113.888H41.1185L36.3089 88.59H35.3357L30.6248 113.888ZM111.697 72.728H131.203V122.26H156.408V140.852H111.697V72.728Z"
                            fill="white"
                        />
                        <path
                            d="M60.9219 95.5059C60.9219 80.0359 68.5664 71.5659 85.3224 71.5659H88.369C105.125 71.5659 112.135 80.0359 112.135 95.5059V100.266H94.2646V95.5059C94.2646 91.3199 92.699 89.2759 88.3831 89.2759H86.2251C81.9092 89.2759 80.3436 91.3059 80.3436 95.5059V118.074C80.3436 122.26 81.8951 124.304 86.2251 124.304H88.369C92.6849 124.304 94.2505 122.274 94.2505 118.074V113.314H112.135V118.06C112.135 133.53 104.49 142 87.7343 142H85.3224C68.5664 142 60.9219 133.53 60.9219 118.06V95.5059ZM154.349 72.7279H173.997V118.368C173.997 122.26 175.322 124.304 179.638 124.304H181.895C186.126 124.304 187.537 122.26 187.537 118.368V72.7279H206.987V117.598C206.987 133.614 198.454 142 181.994 142H179.342C162.882 142 154.349 133.614 154.349 117.598V72.7279Z"
                            fill="white"
                        />
                    </svg>
                </div>
            </div>
        </div>
    </Link>
</template>

<style lang="scss">
    .GayAgenda {
        &.abortion {
            width: 100%;
            border-radius: 3px;
            overflow: hidden;
            position: relative;
            text-decoration: none;
            max-width: 16em;
            box-shadow: 0px 5px 10px -1px #00000021;
            text-align: left;

            &.planned-parenthood {
                background: var(--neon-pink-500);

                .blurb {

                }

                .cta {
                    background: purple;
                    color: var(--neon-pink-100);
                }
            }

            &.aclu {
                background: var(--aclu-blue-lightest);

                .blurb {
                    color: var(--aclu-blue);
                }

                .cta {
                    background: var(--aclu-blue);
                    color: white;
                }
            }

            .planned-parenthood-logo {
                position: absolute;
                bottom: 6px;
                right: 0.75rem;

                svg {
                    width: 1.5rem;
                    height: 1.5rem;
                }
            }

            .aclu-logo {
                position: absolute;
                bottom: -12px;
                right: 1rem;

                svg {
                    width: 3.5rem;
                    height: 3.5rem;
                }
            }

            .content {
                margin-top: auto;
                display: flex;
                flex-direction: column;
                gap: 0.5em;
                align-items: baseline;
            }

            .blurb {
                color: #ffffa2;
                font-family: "Inter", sans-serif;
                line-height: 1.3;
                padding: 1.5rem;
                font-weight: 700;
            }

            .cta {
                font-size: 0.65em;
                line-height: 1;
                font-family: "Inter", sans-serif;
                font-weight: 600;
                width: 100%;
                padding: 1.125em 1.5rem;
                position: relative;
            }
        }
    }
</style>
