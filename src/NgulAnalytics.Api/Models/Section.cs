namespace NgulAnalytics.Api.Models;

public class Section
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Surface, Underground
    public string Description { get; set; } = string.Empty;

    public ICollection<Equipment> Equipment { get; set; } = new List<Equipment>();
    public ICollection<ShiftReport> ShiftReports { get; set; } = new List<ShiftReport>();
    public ICollection<ProductionTarget> ProductionTargets { get; set; } = new List<ProductionTarget>();
}