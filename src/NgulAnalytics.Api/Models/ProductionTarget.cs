namespace NgulAnalytics.Api.Models;

public class ProductionTarget
{
    public int Id { get; set; }
    public int SectionId { get; set; }
    public Section Section { get; set; } = null!;
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TargetTonsCrushed { get; set; }
    public decimal TargetTonsMilled { get; set; }
    public decimal TargetRecovery { get; set; } // %
    public decimal TargetGrade { get; set; } // g/t
    public int? TargetTruckloads { get; set; } // Underground only
}
