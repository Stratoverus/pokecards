import { loadHeaderFooter, navigation, initPokemonSearch } from "./utils.mjs";

let selectedCards = new Set();

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('cardSearch');
    const selectedCardsContainer = document.getElementById('selectedCards');
    const tradeForm = document.getElementById('tradeForm');

    //Adding a card here on enter
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cardName = searchInput.value.trim();
            if (cardName && !selectedCards.has(cardName)) {
                selectedCards.add(cardName);
                updateSelectedCardsDisplay();
            }
            searchInput.value = '';
        }
    });

    //removing a card when clicked
    selectedCardsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-card')) {
            const cardName = e.target.getAttribute('data-card');
            selectedCards.delete(cardName);
            updateSelectedCardsDisplay();
        }
    });

    // Properly handle form submission
    tradeForm.addEventListener('submit', handleTradeSubmit);
});

function updateSelectedCardsDisplay() {
    const container = document.getElementById('selectedCards');
    container.innerHTML = Array.from(selectedCards).map(card => `
        <div class="card-tag">
            ${card}
            <button type="button" class="remove-card" data-card="${card.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" aria-label="Remove ${card}">×</button>
        </div>
    `).join('');
}

function handleTradeSubmit(event) {
    event.preventDefault();
    const tradeData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        cardsWanted: Array.from(selectedCards),
        cardOffered: document.getElementById('cardOffered').value,
        condition: document.getElementById('condition').value,
        comments: document.getElementById('comments').value,
        date: new Date().toLocaleString()
    };
    localStorage.setItem('tradeRequest', JSON.stringify(tradeData));
    window.location.href = 'thankyou.html';
}

async function init() {
  await loadHeaderFooter();
  navigation();
  initPokemonSearch();
}

init();