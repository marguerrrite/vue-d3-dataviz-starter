import {createStore} from "vuex";

const store = createStore({
    state() {
        return {
            themeColor: typeof window !== 'undefined' && localStorage.getItem("mz____") ? JSON.parse(localStorage.getItem("mz____"))["theme"] : "light",
            localStorageKey: "mz____",
            mode: "dev",
            bananas: "bees",
            data: [],
        };
    },

    mutations: {
        setThemeColor(state, theme) {
            // state.themeColor = theme;
            // let storage = localStorage.getItem("mz____") ? JSON.parse(localStorage.getItem("mz____")) : {theme};
            // localStorage.setItem(state.localStorageKey, JSON.stringify({theme}));
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
        setData({commit}, data) {
            commit("setData", data)
        }
    },
});

export default store;
