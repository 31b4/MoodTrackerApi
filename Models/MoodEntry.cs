namespace MoodTrackerApi.Models;

public class MoodEntry
{
    public DateTime Date { get; set; }
    public int Value { get; set; }  // 1-5 skálán
    public string? Note { get; set; }
} 