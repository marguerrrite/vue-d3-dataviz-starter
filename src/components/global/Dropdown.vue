<script>
    export default {
        name: "Dropdown",
        components: {},
        emit: ["selected"],
        props: {
            plain: {
                type: Boolean,
                default: false,
            },
            items: {
                type: [Object, Array],
                required: true,
            },
            icon: {
                type: String,
                default: "arrow",
            },
            value: {
                type: [String, Object, Array],
                required: true,
            },
            noBorder: {
                type: Boolean,
                default: false,
            },
            withActiveListIcon: {
                type: Boolean,
                default: true,
            },
        },
        data() {
            return {
                isListOpen: false,
                itemList: [],
            };
        },
        computed: {},
        methods: {
            toggleOpenList() {
                this.isListOpen = !this.isListOpen;
            },
            initItemList() {
                if (this.items[0]?.value) {
                    // assuming we're passing an already set dict. for now!
                    this.itemList = this.items;
                } else {
                    this.itemList = this.items.map(item => {
                        return {
                            value: item.toLowerCase().replaceAll(" ", "_"),
                            label: item[0].toUpperCase() + item.slice(1),
                        };
                    });
                }
            },
            getOptionSlotName(value, idx) {
                if (value) {
                    value = value.toString();
                    return value
                        .toLowerCase()
                        .replace(" ", "_")
                        .replace(/[^\w\s]/gi, "");
                }
                // sometimes we have a null value for the "All" option
                return `option-${idx}`;
            },
            onSelect(option) {
                this.$emit("selected", option.value);
                this.toggleOpenList();
            },
        },
        mounted() {
            this.initItemList();
        },
    };
</script>

<template>
    <div class="Dropdown">
        <div class="toggle" @click="toggleOpenList" :class="{active: isListOpen, 'no-border': noBorder}">
            <div class="value">
                {{ value }}
            </div>
            <div class="icon" :class="{active: isListOpen}">
                <svg
                    width="12"
                    class="icon-svg"
                    height="10"
                    viewBox="0 0 12 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M1.23828 2.33399L6.11863 7.21433L10.999 2.33398" stroke-width="1.62677" />
                </svg>
            </div>
        </div>
        <div v-if="isListOpen" class="menu" ref="dropdown-menu">
            <div class="list">
                <div class="options" ref="options">
                    <slot v-for="(option, idx) in itemList" :key="idx" :name="getOptionSlotName(option.value, idx)">
                        <Button
                            @mousedown.stop.prevent="onSelect(option)"
                            no-style
                            class="option"
                            :class="{'with-icon': withActiveListIcon}"
                        >
                            <div>
                                {{ option.label }}
                            </div>
                            <div v-if="withActiveListIcon && value == option.label">
                                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                                    <path
                                        d="M3.65 7.8625L0.15 4.4425C-0.05 4.2525 -0.05 3.9525 0.15 3.7625L0.86 3.0825C1.06 2.8925 1.37 2.8925 1.57 3.0825L4.01 5.4725L9.45 0.1425C9.65 -0.0475 9.96 -0.0475 10.16 0.1425L10.87 0.8225C11.07 1.0125 11.07 1.3225 10.87 1.5025L4.37 7.8525C4.16 8.0525 3.84 8.0525 3.65 7.8625Z"
                                        fill="#17171B"
                                    />
                                </svg>
                            </div>
                        </Button>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .Dropdown {
        position: relative;
        max-width: 8em;
        width: fit-content;

        .toggle {
            padding: 0.4em 1em;
            border: 1px solid var(--border-500);
            display: flex;
            justify-content: space-between;
            gap: 1em;
            width: 100%;
            position: relative;

            &.no-border {
                border: none;
                gap: 0.5em;
                padding: 0;
            }

            &.active {
                border: 1px solid var(--grey-500);

                &.no-border {
                    border: none;
                }
                &:before {
                    $btn-pad: 2px;
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    padding: $btn-pad;
                    //outline: 1px solid var(--neon-green-300);
                    content: "";
                    top: -$btn-pad;
                    left: -$btn-pad;
                }
            }

            .icon {
                &.active {
                    transform: rotate(180deg);
                }
            }

            .icon-svg {
                stroke: black;
            }

            &:hover {
                cursor: pointer;
            }
        }

        .menu {
            border: 1px solid var(--border-500);
            border-top: none;
            position: absolute;
            background: var(--background-color);
            right: 0;
            width: fit-content;
            bottom: 0;
            transform: translateY(100%);
            z-index: 10;
        }

        .list {
        }

        .options {
            position: relative;
            max-height: min(300px, 80vh - 30px);
            overflow-y: auto;
            user-select: none;
            width: 100%;

            .option {
                padding: 0.7em 0.7em;
                width: 100%;

                &:hover {
                    cursor: pointer;
                    background: var(--neon-green-300);
                }

                &.with-icon {
                    display: flex;
                    justify-content: space-between;
                    gap: 0.5em;
                }
            }
        }
    }
</style>
