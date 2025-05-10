const API_URL = "/moods";

const form = document.getElementById('moodForm');
const entriesDiv = document.getElementById('entries');
const messageDiv = document.getElementById('message');
const moodSlider = document.getElementById('value');
const moodEmoji = document.querySelector('.mood-emoji');
const moodLabels = document.querySelectorAll('.mood-labels span');

// Emoji mapping
const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Update emoji based on slider value
function updateEmoji(value) {
    moodEmoji.textContent = moodEmojis[value - 1];
    moodEmoji.style.transform = `translateX(-50%) scale(1.2)`;
    setTimeout(() => {
        moodEmoji.style.transform = 'translateX(-50%) scale(1)';
    }, 200);
}

// Slider event listeners
moodSlider.addEventListener('input', (e) => {
    updateEmoji(e.target.value);
});

// Click on emoji labels
moodLabels.forEach((label, index) => {
    label.addEventListener('click', () => {
        moodSlider.value = index + 1;
        updateEmoji(index + 1);
    });
});

// Bejegyzések betöltése
async function loadEntries() {
    entriesDiv.innerHTML = '<em>Betöltés...</em>';
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Hiba a bejegyzések lekérésekor');
        const data = await res.json();
        if (data.length === 0) {
            entriesDiv.innerHTML = '<em>Nincs még bejegyzés.</em>';
            return;
        }
        entriesDiv.innerHTML = '';
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        data.forEach(entry => {
            entriesDiv.innerHTML += `
                <div class="entry">
                    <div class="entry-date">${entry.date.split('T')[0]}</div>
                    <div class="entry-value">
                        <span>${moodEmojis[entry.value - 1]}</span>
                        Hangulat: <b>${entry.value}</b>
                    </div>
                    <div class="entry-note">${entry.note ? entry.note : ''}</div>
                </div>
            `;
        });
    } catch (err) {
        entriesDiv.innerHTML = '<span style="color:red">Nem sikerült betölteni a bejegyzéseket.</span>';
    }
}

// Új bejegyzés mentése
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';
    const date = document.getElementById('date').value;
    const value = document.getElementById('value').value;
    const note = document.getElementById('note').value;

    if (!date || !value) {
        messageDiv.textContent = 'Minden mező kitöltése kötelező!';
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: date,
                value: Number(value),
                note: note
            })
        });
        if (res.status === 201) {
            messageDiv.style.color = '#38a169';
            messageDiv.textContent = 'Sikeres mentés!';
            form.reset();
            // Reset date to today
            document.getElementById('date').valueAsDate = new Date();
            // Reset slider to middle
            moodSlider.value = 3;
            updateEmoji(3);
            loadEntries();
        } else {
            const err = await res.text();
            messageDiv.style.color = '#e53e3e';
            messageDiv.textContent = err;
        }
    } catch (err) {
        messageDiv.style.color = '#e53e3e';
        messageDiv.textContent = 'Hiba a mentés során!';
    }
});

// Oldal betöltésekor bejegyzések betöltése
window.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    updateEmoji(moodSlider.value);
}); 