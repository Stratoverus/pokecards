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

//Had to make this so that github pages worked and also my local testing environment worked too.
function getBasePath() {
  const isGitHub = window.location.hostname === "stratoverus.github.io";
  const isInPokemonDir = window.location.pathname.includes('/pokemon/');
  
  if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
    return isInPokemonDir ? '../' : '';
  }

  if (isGitHub) {
    return isInPokemonDir ? '/pokecards/../' : '/pokecards/';
  }

  return '';
}

export async function loadHeaderFooter() {
  const basePath = getBasePath();

  const header = await loadTemplate(`${basePath}partials/header.html`);
  const headerElement = document.querySelector("#start-header");
  renderWithTemplate(header, headerElement);

  //Fix navigation links
  headerElement.querySelectorAll('nav a').forEach(link => {
    //Remove leading slash if it exists and prepend basePath
    const href = link.getAttribute('href').replace(/^\//, '');
    link.href = `${basePath}${href}`;
  });

  //After rendering header, fix image paths
  headerElement.querySelectorAll('img').forEach(img => {
    if (img.src.includes('images/')) {
      img.src = `${basePath}${img.getAttribute('src')}`;
    }
  });

  const footer = await loadTemplate(`${basePath}partials/footer.html`);
  const footerElement = document.querySelector("#end-footer");
  renderWithTemplate(footer, footerElement);

  //After rendering footer, fix image paths
  footerElement.querySelectorAll('img').forEach(img => {
    if (img.src.includes('images/')) {
      img.src = `${basePath}${img.getAttribute('src')}`;
    }
  });
}

export function navigation() {
    const mainnav = document.querySelector('.navigation')
    const hambutton = document.querySelector('#menu');
    hambutton.addEventListener('click', () => {
        mainnav.classList.toggle('show');
        hambutton.classList.toggle('show');
    });

    document.addEventListener("DOMContentLoaded", function () {
        let currentPage = window.location.pathname.split("/").pop();

        if (currentPage === "") {
            currentPage = "index.html";
        }

        const pageMap = {
            "index.html": "home",
            "collection.html": "collection",
            "trading-guide.html": "trading-guide",
            "trade.html": "trade",
        };

        if (pageMap[currentPage]) {
            document.getElementById(pageMap[currentPage]).classList.add("active");
        }
    });
}