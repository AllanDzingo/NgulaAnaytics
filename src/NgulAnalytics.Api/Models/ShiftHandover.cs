namespace NgulAnalytics.Api.Models;

public class ShiftHandover
{
    public int Id { get; set; }
    public int ShiftReportId { get; set; }
    public ShiftReport ShiftReport { get; set; } = null!;
    public string? MajorEvents { get; set; }
    public string? EquipmentIssues { get; set; }
    public string? SafetyConcerns { get; set; }
    public string? ProductionConcerns { get; set; }
    public string? OutstandingActions { get; set; }
    public string? GeneralNotes { get; set; }
}
