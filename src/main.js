import {createApp} from "vue";
import {createRouter, createWebHistory} from "vue-router";
import {createHead} from "@vueuse/head";
import VuePapaParse from "vue-papa-parse";
import App from "./App.vue";
import routes from "./pages/urls.js";
import store from "./store/";
import utils from "./scripts/utils.js";

const app = createApp(App);

const widgets = import.meta.globEager("./components/**/*.vue");
for (const path in widgets) {
    let componentConfig = widgets[path];
    const componentName = componentConfig.default.name;
    app.component(componentName, componentConfig.default || componentConfig);
}

app.mixin({
    methods: utils.filters,
});

const layouts = import.meta.globEager("./layouts/**/*.vue");
for (const path in layouts) {
    let componentConfig = layouts[path];
    const componentName = componentConfig.default.name;
    app.component(componentName, componentConfig.default || componentConfig);
}

let mode = import.meta.env.VITE_STAGE;

let allRoutes = [...routes];

store.dispatch("setMode", mode);

let router = createRouter({
    history: createWebHistory(),
    base: import.meta.env.BASE_URL,
    routes: allRoutes,
});

const head = createHead();

app.use(VuePapaParse);

app.use(store);
app.use(router);
app.use(head);
app.mount("#app");
