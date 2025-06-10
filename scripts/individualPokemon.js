import { loadHeaderFooter, navigation } from "./utils.mjs";
import { fetchPokemonCards } from "./tcgapi.mjs";

const BASE_URL = 'https://pokeapi.co/api/v2';

async function getPokemonById(id) {
    try {
        const response = await fetch(`${BASE_URL}/pokemon/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        return null;
    }
}

function createPokemonDetails(pokemon) {
    const template = document.querySelector('.pokemon-template');
    const types = pokemon.types.map(type => type.type.name).join(', ');
    const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');
    
    template.innerHTML = `
        <div class="pokemon-profile">
            <h1>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h1>
            <p class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</p>
            <div class="pokemon-images">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name} front view">
                ${pokemon.sprites.back_default ? `<img src="${pokemon.sprites.back_default}" alt="${pokemon.name} back view">` : ''}
            </div>
            <div class="pokemon-info">
                <div class="info-group">
                    <h2>Basic Info</h2>
                    <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
                    <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
                    <p><strong>Types:</strong> ${types}</p>
                    <p><strong>Abilities:</strong> ${abilities}</p>
                </div>
                <div class="stats-group">
                    <h2>Base Stats</h2>
                    ${pokemon.stats.map(stat => `
                        <div class="stat-bar">
                            <span class="stat-name">${stat.stat.name}</span>
                            <div class="stat-value" style="width: ${(stat.base_stat / 255) * 100}%">
                                ${stat.base_stat}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="pokemon-cards">
            <h2>Trading Cards</h2>
            <div id="cards-container"></div>
        </div>
    `;
}

function displayCards(cards) {
    const container = document.getElementById('cards-container');
    
    if (cards.length === 0) {
        container.innerHTML = '<p>No cards found for this Pokemon.</p>';
        return;
    }

    container.innerHTML = cards.map(card => `
        <div class="card">
            <img src="${card.images.small}" alt="${card.name}">
            <p>${card.set.name} - ${card.number}/${card.set.printedTotal}</p>
        </div>
    `).join('');
}

async function init() {
    await loadHeaderFooter();
    navigation();

    const params = new URLSearchParams(window.location.search);
    const pokemonId = params.get('id');

    if (pokemonId) {
        try {
            const pokemon = await getPokemonById(pokemonId);
            if (pokemon) {
                document.getElementById('loading-state').style.display = 'none';
                createPokemonDetails(pokemon);
                const cards = await fetchPokemonCards(pokemon.name);
                displayCards(cards);
            } else {
                throw new Error('Pokemon not found');
            }
        } catch (error) {
            document.getElementById('loading-state').style.display = 'none';
            document.getElementById('error-state').style.display = 'block';
        }
    } else {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
    }
}

init();