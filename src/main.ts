import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

createApp(App).mount("#app");
const appTitle = import.meta.env.ENV;
const apiUrl = import.meta.env.VITE_EDITOR;
console.log(`test:>`, { appTitle, apiUrl });
