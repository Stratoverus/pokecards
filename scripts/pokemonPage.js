import { loadHeaderFooter, navigation, initPokemonSearch } from "./utils.mjs";
import { getPokemonList, getPokemonDetails, createPokemonCard } from "./pokeapi.mjs";

let offset = 0;
let isLoading = false;

async function loadPokemon() {
    if (isLoading) return;
    
    isLoading = true;
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';

    const pokemonList = await getPokemonList(offset);
    if (pokemonList && pokemonList.results) {
        const grid = document.getElementById('pokemon-grid');
        
        for (const pokemon of pokemonList.results) {
            const details = await getPokemonDetails(pokemon.url);
            if (details) {
                const card = createPokemonCard(details);
                grid.appendChild(card);
            }
        }
        
        offset += pokemonList.results.length;
    }

    isLoading = false;
    loadingElement.style.display = 'none';
}

function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadPokemon();
    }
}

async function init() {
    await loadHeaderFooter();
    navigation();
    initPokemonSearch();
    
    await loadPokemon();
    
    window.addEventListener('scroll', handleScroll);
}

init();