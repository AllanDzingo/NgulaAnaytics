namespace NgulAnalytics.Api.Models;

public class UndergroundReading
{
    public int Id { get; set; }
    public int ShiftReportId { get; set; }
    public ShiftReport ShiftReport { get; set; } = null!;
    public int TruckloadsExcavated { get; set; }
    public decimal OxygenLevelStart { get; set; } // %
    public decimal OxygenLevelMidshift { get; set; } // %
    public decimal OxygenLevelFinish { get; set; } // %
    public decimal DustLevel { get; set; } // mg/m³
    public Visibility Visibility { get; set; } = Visibility.Good;
    public int Incidents { get; set; }
    public string? IncidentDescriptions { get; set; }
}

public enum Visibility
{
    Good,
    Moderate,
    Poor,
    Hazardous
}
