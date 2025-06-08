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

export async function loadHeaderFooter() {
  const header = await loadTemplate("/partials/header.html");
  const headerElement = document.querySelector("#start-header");
  renderWithTemplate(header, headerElement)

  const footer = await loadTemplate("/partials/footer.html");
  const footerElement = document.querySelector("#end-footer");
  renderWithTemplate(footer, footerElement)

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