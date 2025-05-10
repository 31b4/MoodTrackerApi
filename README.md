# Mood Tracker – Dokumentáció

## Projekt leírása
A Mood Tracker egy egyszerű, webalapú hangulatnapló alkalmazás, amely lehetővé teszi a felhasználók számára, hogy napi hangulatukat rögzítsék, értékeljék és jegyzetet fűzzenek hozzá. A projekt célja, hogy bemutassa a C# alapú webfejlesztés (ASP.NET 8 minimal API) és a modern frontend technológiák (HTML, CSS, JavaScript) együttes használatát.

## Főbb funkciók
- **Hangulat rögzítése:** A felhasználó egy csúszkán (slider) választhatja ki a napi hangulatát (1-5), emoji vizuális visszajelzéssel.
- **Dátum és jegyzet:** Minden bejegyzéshez dátum és opcionális jegyzet tartozik.
- **Bejegyzések listázása:** A felhasználó visszanézheti a korábbi bejegyzéseit.
- **Bejegyzés szerkesztése, törlése:** A bejegyzések szerkeszthetők vagy törölhetők a listából.
- **Statisztikák, grafikon:** Átlag, minimum, maximum hangulat, valamint vonaldiagram (line graph) a bejegyzésekről.
- **Modern, letisztult felület:** Reszponzív, felhasználóbarát design.
- **Swagger UI:** Az API végpontok tesztelhetők a beépített Swagger felületen is.

## Technológiák
- **Backend:**
  - C# (.NET 8 minimal API)
  - Adattárolás: JSON fájl (fájl alapú, nem szükséges adatbázis)
- **Frontend:**
  - HTML5, CSS3 (modern, reszponzív design)
  - Vanilla JavaScript (API hívások, interaktív slider, szerkesztés/törlés, vonaldiagram)
- **Fejlesztői környezet:**
  - Visual Studio Code
  - .NET 8 SDK

## Futtatás
1. **API indítása:**
   ```bash
   dotnet run
   ```
2. **Webes felület használata:**
   - Nyisd meg a böngészőben: [http://localhost:5241](http://localhost:5241)
3. **Swagger UI (API tesztelés):**
   - [http://localhost:5241/swagger](http://localhost:5241/swagger)

## Endpoints

- GET     /moods              – Összes bejegyzés lekérése
- GET     /moods/{date}       – Bejegyzés lekérése adott dátumhoz
- POST    /moods              – Új bejegyzés létrehozása
- PUT     /moods/{date}       – Bejegyzés szerkesztése adott dátumhoz
- DELETE  /moods/{date}       – Bejegyzés törlése adott dátumhoz

Példák:
- http://localhost:5241/moods
- http://localhost:5241/moods/2024-05-12

## Fájlstruktúra
```
MoodTrackerApi/
├── Models/
│   └── MoodEntry.cs
├── wwwroot/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── Program.cs
├── MoodTrackerApi.csproj
├── mood_entries.json
└── README.md
```

## Működés röviden
- A felhasználó a webes felületen kiválasztja a dátumot, beállítja a hangulatát (1-5, emoji sliderrel), és opcionálisan jegyzetet ír.
- A bejegyzés mentése után az adatok egy JSON fájlba kerülnek.
- A főoldalon megjelennek a korábbi bejegyzések is, melyek szerkeszthetők vagy törölhetők.
- A statisztika szekcióban látható az átlag, minimum, maximum hangulat, valamint egy vonaldiagram a bejegyzésekről.
- Az API minimal stílusú, nincsenek külön controllerek, minden a Program.cs-ben van.

---

**Készítette:** Szilágyi Bence
