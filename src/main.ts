import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import {
  BiQuestionCircle,
  FaArrowRight,
  FaArrowLeft,
  FaArrowDown,
} from "oh-vue-icons/icons";

addIcons(BiQuestionCircle, FaArrowRight, FaArrowLeft, FaArrowDown);

const app = createApp(App);
app.component("v-icon", OhVueIcon);

app.mount("#app");
