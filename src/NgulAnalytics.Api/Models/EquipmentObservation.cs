namespace NgulAnalytics.Api.Models;

public class EquipmentObservation
{
    public int Id { get; set; }
    public int ShiftReportId { get; set; }
    public ShiftReport ShiftReport { get; set; } = null!;
    public int EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
    public decimal NoiseLevel { get; set; }
    public string VibrationObservation { get; set; } = string.Empty; // Normal, Elevated, Severe
    public string TemperatureObservation { get; set; } = string.Empty; // Normal, Elevated, Critical
    public string GeneralCondition { get; set; } = "Good"; // Excellent, Good, Fair, Poor, Critical
}