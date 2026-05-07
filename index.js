import { registerRootComponent } from "expo";
import App from "./App";
import { LogBox } from "react-native";

registerRootComponent(App)
LogBox.ignoreAllLogs()