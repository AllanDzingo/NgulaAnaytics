namespace NgulAnalytics.Api.Models;

public class ProductionEntry
{
    public int Id { get; set; }
    public int ShiftReportId { get; set; }
    public ShiftReport ShiftReport { get; set; } = null!;
    public decimal TonsCrushed { get; set; }
    public decimal TonsMilled { get; set; }
    public decimal FeedGrade { get; set; }
    public decimal RecoveryPercentage { get; set; }
    public decimal ConcentrateProduced { get; set; }
    public string Comments { get; set; } = string.Empty;
}