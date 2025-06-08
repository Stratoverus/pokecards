import { loadHeaderFooter, navigation } from "./utils.mjs";

async function init() {
  await loadHeaderFooter();
  navigation();
}

init();