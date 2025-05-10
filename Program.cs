using System.Text.Json;
using MoodTrackerApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS beállítások
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

// Statikus fájlok kiszolgálása
app.UseDefaultFiles();
app.UseStaticFiles();

// CORS engedélyezése
app.UseCors();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

// JSON fájl elérési útja
string jsonFilePath = "mood_entries.json";

// Segédfüggvény a JSON fájl betöltéséhez
List<MoodEntry> LoadMoodEntries()
{
    if (!File.Exists(jsonFilePath))
    {
        return new List<MoodEntry>();
    }
    
    var json = File.ReadAllText(jsonFilePath);
    return JsonSerializer.Deserialize<List<MoodEntry>>(json) ?? new List<MoodEntry>();
}

// Segédfüggvény a JSON fájl mentéséhez
void SaveMoodEntries(List<MoodEntry> entries)
{
    var json = JsonSerializer.Serialize(entries, new JsonSerializerOptions { WriteIndented = true });
    File.WriteAllText(jsonFilePath, json);
}

// GET: Összes hangulatbejegyzés lekérése
app.MapGet("/moods", () =>
{
    var entries = LoadMoodEntries();
    return Results.Ok(entries);
});

// GET: Hangulatbejegyzés lekérése dátum alapján
app.MapGet("/moods/{date}", (DateTime date) =>
{
    var entries = LoadMoodEntries();
    var entry = entries.FirstOrDefault(e => e.Date.Date == date.Date);
    
    if (entry == null)
    {
        return Results.NotFound($"Nincs bejegyzés a következő dátumhoz: {date:yyyy-MM-dd}");
    }
    
    return Results.Ok(entry);
});

// POST: Új hangulatbejegyzés létrehozása
app.MapPost("/moods", (MoodEntry entry) =>
{
    if (entry.Value < 1 || entry.Value > 5)
    {
        return Results.BadRequest("A hangulat értékének 1 és 5 között kell lennie!");
    }

    var entries = LoadMoodEntries();
    
    // Ellenőrizzük, hogy van-e már bejegyzés az adott dátumhoz
    var existingEntry = entries.FirstOrDefault(e => e.Date.Date == entry.Date.Date);
    if (existingEntry != null)
    {
        return Results.BadRequest($"Már létezik bejegyzés a következő dátumhoz: {entry.Date:yyyy-MM-dd}");
    }
    
    entries.Add(entry);
    SaveMoodEntries(entries);
    
    return Results.Created($"/moods/{entry.Date:yyyy-MM-dd}", entry);
});

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
