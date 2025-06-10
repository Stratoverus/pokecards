const POKEMON_PER_PAGE = 48;
const BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; //7 days in milliseconds
const CACHE_KEY = 'pokemon_data';

function getFromCache() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};

    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return {};
    }
    return data;
}

function saveToCache(pokemonData) {
    const existingData = getFromCache();
    const cacheData = {
        timestamp: Date.now(),
        data: { ...existingData, ...pokemonData }
    };
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Cache storage failed:', error);
        localStorage.removeItem(CACHE_KEY);
    }
}

export async function getPokemonList(offset = 0) {
    const cachedData = getFromCache();
    const cacheKey = `list_${offset}`;
    
    if (cachedData[cacheKey]) return cachedData[cacheKey];

    try {
        const response = await fetch(`${BASE_URL}/pokemon?limit=${POKEMON_PER_PAGE}&offset=${offset}`);
        const data = await response.json();
        saveToCache({ [cacheKey]: data });
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon list:', error);
        return null;
    }
}

export async function getPokemonDetails(url) {
    const cachedData = getFromCache();
    const id = url.split('/').slice(-2, -1)[0];
    
    if (cachedData[id]) return cachedData[id];

    try {
        const response = await fetch(url);
        const fullData = await response.json();
        
        const minimalData = {
            id: fullData.id,
            name: fullData.name,
            sprites: {
                front_default: fullData.sprites.front_default
            }
        };
        
        saveToCache({ [id]: minimalData });
        return minimalData;
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
        return null;
    }
}

export function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    
    card.innerHTML = `
        <a href="/pokemon/index.html?id=${pokemon.id}">
            <img 
                src="${pokemon.sprites.front_default}" 
                alt="${pokemon.name}"
                loading="lazy"
                class="pokemon-sprite"
            >
            <p class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</p>
            <h5 class="pokemon-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h5>
        </a>
    `;
    
    return card;
}