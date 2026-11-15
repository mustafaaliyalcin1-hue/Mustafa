import { Config } from "@remotion/cli/config";
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("swangle");
// remotion.media engelli: makinedeki Playwright headless Chromium
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
