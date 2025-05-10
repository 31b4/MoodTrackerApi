const API_URL = "/moods";

const form = document.getElementById('moodForm');
const entriesDiv = document.getElementById('entries');
const messageDiv = document.getElementById('message');
const moodSlider = document.getElementById('value');
const moodEmoji = document.querySelector('.mood-emoji');
const moodLabels = document.querySelectorAll('.mood-labels span');
const statsDiv = document.getElementById('stats');

// Emoji mapping
const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
let editMode = false;
let editDate = null;

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

// Statisztika és grafikon
function renderStats(entries) {
    if (!entries.length) {
        statsDiv.innerHTML = '';
        return;
    }
    const values = entries.map(e => e.value);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const min = Math.min(...values);
    const max = Math.max(...values);
    statsDiv.innerHTML = `
        <div class="stats-box">
            <b>Statisztika:</b><br>
            Átlag: <b>${avg}</b> &nbsp;|&nbsp; Min: <b>${min}</b> &nbsp;|&nbsp; Max: <b>${max}</b>
            <div style="width: 320px; height: 120px;">
                <canvas id="moodChart" width="640" height="240" style="width:320px; height:120px;"></canvas>
            </div>
        </div>
    `;
    renderChart(entries);
}

function renderChart(entries) {
    const canvas = document.getElementById('moodChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // High-DPI scaling
    ctx.save();
    ctx.scale(2, 2);
    // Line graph: X = date, Y = value
    const maxVal = 5;
    const chartHeight = 80;
    const offsetY = 30;
    const chartWidth = 280;
    const leftPad = 20;
    const points = entries.slice(-12).map((entry, i, arr) => {
        const x = leftPad + i * (chartWidth / Math.max(arr.length - 1, 1));
        const y = offsetY + chartHeight - (entry.value / maxVal) * chartHeight;
        return { x, y, date: entry.date, value: entry.value };
    });
    // Draw line
    ctx.strokeStyle = '#3182ce';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    // Draw points
    points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    // Draw labels (rotated, more visible)
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#333';
    points.forEach((pt, i) => {
        ctx.save();
        ctx.translate(pt.x, offsetY + chartHeight + 18);
        ctx.rotate(-Math.PI / 5);
        ctx.textAlign = 'right';
        ctx.fillText(pt.date.split('T')[0].slice(5), 0, 0);
        ctx.restore();
        ctx.fillText(pt.value, pt.x - 4, pt.y - 8);
    });
    ctx.restore();
}

// Bejegyzések betöltése
async function loadEntries() {
    entriesDiv.innerHTML = '<em>Betöltés...</em>';
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Hiba a bejegyzések lekérésekor');
        const data = await res.json();
        if (data.length === 0) {
            entriesDiv.innerHTML = '<em>Nincs még bejegyzés.</em>';
            statsDiv.innerHTML = '';
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
                    <div class="entry-actions">
                        <button class="edit-btn" data-date="${entry.date}">✏️</button>
                        <button class="delete-btn" data-date="${entry.date}">🗑️</button>
                    </div>
                </div>
            `;
        });
        renderStats(data);
        // Gombok eseménykezelői
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => startEdit(btn.dataset.date, data);
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => deleteEntry(btn.dataset.date);
        });
    } catch (err) {
        entriesDiv.innerHTML = '<span style="color:red">Nem sikerült betölteni a bejegyzéseket.</span>';
        statsDiv.innerHTML = '';
    }
}

function startEdit(date, data) {
    const entry = data.find(e => e.date.startsWith(date));
    if (!entry) return;
    editMode = true;
    editDate = entry.date;
    document.getElementById('date').value = entry.date.split('T')[0];
    moodSlider.value = entry.value;
    updateEmoji(entry.value);
    document.getElementById('note').value = entry.note || '';
    messageDiv.textContent = 'Szerkesztési mód: ' + entry.date.split('T')[0];
    messageDiv.style.color = '#3182ce';
}

async function deleteEntry(date) {
    if (!confirm('Biztosan törlöd ezt a bejegyzést?')) return;
    try {
        const res = await fetch(`${API_URL}/${date}`, { method: 'DELETE' });
        if (res.status === 204) {
            messageDiv.style.color = '#38a169';
            messageDiv.textContent = 'Sikeres törlés!';
            loadEntries();
        } else {
            messageDiv.style.color = '#e53e3e';
            messageDiv.textContent = 'Nem sikerült törölni!';
        }
    } catch {
        messageDiv.style.color = '#e53e3e';
        messageDiv.textContent = 'Hiba a törlés során!';
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

    if (editMode && editDate) {
        // Szerkesztés
        try {
            const res = await fetch(`${API_URL}/${date}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, value: Number(value), note })
            });
            if (res.ok) {
                messageDiv.style.color = '#38a169';
                messageDiv.textContent = 'Sikeres szerkesztés!';
                form.reset();
                document.getElementById('date').valueAsDate = new Date();
                moodSlider.value = 3;
                updateEmoji(3);
                editMode = false;
                editDate = null;
                loadEntries();
            } else {
                const err = await res.text();
                messageDiv.style.color = '#e53e3e';
                messageDiv.textContent = err;
            }
        } catch {
            messageDiv.style.color = '#e53e3e';
            messageDiv.textContent = 'Hiba a szerkesztés során!';
        }
    } else {
        // Új bejegyzés
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, value: Number(value), note })
            });
            if (res.status === 201) {
                messageDiv.style.color = '#38a169';
                messageDiv.textContent = 'Sikeres mentés!';
                form.reset();
                document.getElementById('date').valueAsDate = new Date();
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
    }
});

// Oldal betöltésekor bejegyzések betöltése
window.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    updateEmoji(moodSlider.value);
}); 