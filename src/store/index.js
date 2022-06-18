import {createStore} from "vuex";

const store = createStore({
    state() {
        return {
            chartStyle: typeof window !== 'undefined' && localStorage.getItem("d3cs____") ? JSON.parse(localStorage.getItem("d3cs____"))["style"] : "styled",
            localStorageKey: "d3cs____",
        };
    },

    mutations: {
        setChartStyle(state, style) {
            state.chartStyle = style;
            let storage = localStorage.getItem(state.localStorageKey) ? JSON.parse(localStorage.getItem(state.localStorageKey)) : {style};
            localStorage.setItem(state.localStorageKey, JSON.stringify({style}));
        },
        setMode(state, mode) {
            state.mode = mode;
        },
        setData(state, data) {
            state.data = data;
        }
    },

    actions: {
        setMode({commit}, mode) {
            commit("setMode", mode)
        },
        setChartStyle({commit}, style) {
            commit("setChartStyle", style)
        },
    },
});

export default store;
