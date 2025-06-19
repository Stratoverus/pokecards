import { loadHeaderFooter, navigation, initPokemonSearch } from "./utils.mjs";

async function init() {
  await loadHeaderFooter();
  navigation();
  initPokemonSearch();
}

init();