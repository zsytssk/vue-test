import { ConfigEnv, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import WaPosition from './script/waPosition'

// https://vite.dev/config/

export default ({ command, mode }:ConfigEnv) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      env.VITE_POSITION === 'open' && WaPosition(),
      vue()
    ],
  };
};
