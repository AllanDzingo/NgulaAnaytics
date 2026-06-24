namespace NgulAnalytics.Api.Models;

public class SheqObservation
{
    public int Id { get; set; }
    public int ShiftReportId { get; set; }
    public ShiftReport ShiftReport { get; set; } = null!;
    public int Incidents { get; set; }
    public int NearMisses { get; set; }
    public string SafetyObservations { get; set; } = string.Empty;
    public string EnvironmentalObservations { get; set; } = string.Empty;
    public decimal AirQualityScore { get; set; }
    public decimal DustLevel { get; set; }
    public decimal HeatIndex { get; set; }
}