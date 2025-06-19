import { getPokemonList, getPokemonDetails } from './pokeapi.mjs';

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

async function loadTemplate(path) { 
  const response = await fetch(path);
  const template = await response.text();
  return template;

}

//Having this here to fix some 404's that were happening.
function getBasePath() {
  return window.location.pathname.includes('/pokemon/') ? '../' : '';
}

export async function loadHeaderFooter() {
  const basePath = getBasePath();
  
  //Load header from root partials directory
  const header = await loadTemplate(`${basePath}partials/header.html`);
  const headerElement = document.querySelector("#start-header");
  renderWithTemplate(header, headerElement);

  //Fix navigation links
  headerElement.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href !== '#') {  //Skip the menu toggle button
      link.href = `${basePath}${href}`;
    }
  });

  //Fix header image paths
  headerElement.querySelectorAll('img').forEach(img => {
    if (img.src.includes('images/')) {
      img.src = `${basePath}${img.getAttribute('src')}`;
    }
  });

  //Added additional checks to make sure that pokemon/index.html wouldn't show up as home.
  const pathname = window.location.pathname;
  let activeNavId = null;
  if (pathname === '/' || pathname === '/index.html') {
    activeNavId = 'home';
  } else if (pathname === '/pokemon/index.html' || pathname.startsWith('/pokemon/')) {
    activeNavId = 'pokemon';
  } else {
    let currentPage = pathname.split("/").pop();
    if (currentPage === "") {
      currentPage = "index.html";
    }
    const pageMap = {
      "index.html": "home",
      "pokemon.html": "pokemon",
      "collection.html": "collection",
      "trading-guide.html": "trading-guide",
      "trade.html": "trade",
    };
    activeNavId = pageMap[currentPage];
  }
  if (activeNavId) {
    const navLink = document.getElementById(activeNavId);
    if (navLink) {
      navLink.classList.add("active");
    }
  }


  //Load footer from root partials directory
  const footer = await loadTemplate(`${basePath}partials/footer.html`);
  const footerElement = document.querySelector("#end-footer");
  renderWithTemplate(footer, footerElement);

  //Fix footer image paths
  footerElement.querySelectorAll('img').forEach(img => {
    if (img.src.includes('images/')) {
      img.src = `${basePath}${img.getAttribute('src')}`;
    }
  });
}

export function navigation() {
    const mainnav = document.querySelector('.navigation');
    const hambutton = document.querySelector('#menu');
    const chevron = hambutton.querySelector('.chevron');
    hambutton.addEventListener('click', () => {
        mainnav.classList.toggle('show');
        hambutton.classList.toggle('open');
        chevron.textContent = mainnav.classList.contains('show') ? '▲' : '▼';
    });

    // Set current page label only
    const currentPath = window.location.pathname.split('/').pop();
    const links = mainnav.querySelectorAll('a');
    let found = false;
    links.forEach(link => {
        if (link.classList.contains('active')) {
            hambutton.querySelector('#current-page-label').textContent = link.textContent;
            found = true;
        }
    });
    if (!found) {
        hambutton.querySelector('#current-page-label').textContent = 'Menu';
    }
}

let allPokemonList = null;

export async function getAllPokemonNames() {
  if (allPokemonList) return allPokemonList;
  const cacheKey = 'all_pokemon_names';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    allPokemonList = JSON.parse(cached);
    return allPokemonList;
  }
  //Fetch all names (PokéAPI currently has ~1300 Pokémon, but will definitely grow when the new gen comes out soon)
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300');
  const data = await response.json();
  allPokemonList = data.results;
  localStorage.setItem(cacheKey, JSON.stringify(allPokemonList));
  return allPokemonList;
}

export function initPokemonSearch() {
  const searchInput = document.getElementById('pokemon-search');
  if (!searchInput) return;

  let resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) {
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.style.position = 'absolute';
    resultsContainer.style.background = '#fff';
    resultsContainer.style.zIndex = '1000';
    resultsContainer.style.maxHeight = '300px';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.border = '1px solid #ccc';
    document.querySelector('.search-container').appendChild(resultsContainer);
    resultsContainer.style.display = 'none'; //Making sure this is hidden when loading the page
  }

  async function searchPokemon(query) {
    resultsContainer.innerHTML = '';
    if (!query) return;
    const listData = await getAllPokemonNames();
    const matches = listData.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (matches.length === 0) {
      resultsContainer.innerHTML = '<div style="padding:8px;">No results found.</div>';
      return;
    }
    //Limit to 10 results for performance
    for (const match of matches.slice(0, 10)) {
      const details = await getPokemonDetails(match.url);
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.cursor = 'pointer';
      item.style.padding = '6px 10px';
      item.innerHTML = `
        <img src="${details.sprites.front_default}" alt="${details.name}" style="width:48px;height:48px;margin-right:10px;">
        <span>#${details.id.toString().padStart(3, '0')} ${details.name.charAt(0).toUpperCase() + details.name.slice(1)}</span>
      `;
      item.onclick = () => {
        window.location.href = `/pokemon/index.html?id=${details.id}`;
      };
      resultsContainer.appendChild(item);
    }
  }

  searchInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value.length > 0) {
      searchPokemon(value);
      resultsContainer.style.display = 'block';
    } else {
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'none';
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = searchInput.value.trim();
      if (value.length > 0) {
        searchPokemon(value);
        resultsContainer.style.display = 'block';
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!resultsContainer.contains(e.target) && e.target !== searchInput) {
      resultsContainer.style.display = 'none';
    }
  });
}