namespace NgulAnalytics.Api.DTOs;

public class CreateShiftReportDto
{
    public DateTime Date { get; set; }
    public string Shift { get; set; } = string.Empty;
    public int SectionId { get; set; }
    public CreateProductionEntryDto? ProductionEntry { get; set; }
    public List<CreateDowntimeEntryDto>? DowntimeEntries { get; set; }
    public List<CreateEquipmentObservationDto>? EquipmentObservations { get; set; }
    public CreateSheqObservationDto? SheqObservation { get; set; }
    public CreateUndergroundReadingDto? UndergroundReading { get; set; }
    public CreateShiftHandoverDto? Handover { get; set; }
    
    // Efficiency/Resource metrics
    public decimal FuelUsageLiters { get; set; }
    public decimal EnergyKwh { get; set; }
    public decimal WaterKl { get; set; }
}

public class CreateProductionEntryDto
{
    public decimal TonsCrushed { get; set; }
    public decimal TonsMilled { get; set; }
    public decimal FeedGrade { get; set; }
    public decimal RecoveryPercentage { get; set; }
    public decimal ConcentrateProduced { get; set; }
    public string? Comments { get; set; }
}

public class CreateDowntimeEntryDto
{
    public int EquipmentId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal DurationHours { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string CorrectiveAction { get; set; } = string.Empty;
}

public class CreateEquipmentObservationDto
{
    public int EquipmentId { get; set; }
    public decimal NoiseLevel { get; set; }
    public string VibrationObservation { get; set; } = string.Empty;
    public string TemperatureObservation { get; set; } = string.Empty;
    public string GeneralCondition { get; set; } = string.Empty;
}

public class CreateSheqObservationDto
{
    public int Incidents { get; set; }
    public int NearMisses { get; set; }
    public string? SafetyObservations { get; set; }
    public string? EnvironmentalObservations { get; set; }
    public decimal AirQualityScore { get; set; }
    public decimal DustLevel { get; set; }
    public decimal HeatIndex { get; set; }
}

public class CreateUndergroundReadingDto
{
    public int TruckloadsExcavated { get; set; }
    public decimal OxygenLevelStart { get; set; }
    public decimal OxygenLevelMidshift { get; set; }
    public decimal OxygenLevelFinish { get; set; }
    public decimal DustLevel { get; set; }
    public string Visibility { get; set; } = string.Empty;
    public int Incidents { get; set; }
    public string? IncidentDescriptions { get; set; }
}

public class CreateShiftHandoverDto
{
    public string MajorEvents { get; set; } = string.Empty;
    public string EquipmentIssues { get; set; } = string.Empty;
    public string SafetyConcerns { get; set; } = string.Empty;
    public string ProductionConcerns { get; set; } = string.Empty;
    public string OutstandingActions { get; set; } = string.Empty;
    public string GeneralNotes { get; set; } = string.Empty;
}

public class ShiftReportDetailDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Shift { get; set; } = string.Empty;
    public string SupervisorName { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public ProductionEntryDto? ProductionEntry { get; set; }
    public List<DowntimeEntryDto>? DowntimeEntries { get; set; }
    public List<EquipmentObservationDto>? EquipmentObservations { get; set; }
    public SheqObservationDto? SheqObservation { get; set; }
    public UndergroundReadingDto? UndergroundReading { get; set; }
    public ShiftHandoverDto? Handover { get; set; }
    
    // Efficiency/Resource metrics
    public decimal FuelUsageLiters { get; set; }
    public decimal EnergyKwh { get; set; }
    public decimal WaterKl { get; set; }
}

public class ProductionEntryDto
{
    public decimal TonsCrushed { get; set; }
    public decimal TonsMilled { get; set; }
    public decimal FeedGrade { get; set; }
    public decimal RecoveryPercentage { get; set; }
    public decimal ConcentrateProduced { get; set; }
    public string? Comments { get; set; }
}

public class DowntimeEntryDto
{
    public int Id { get; set; }
    public string EquipmentName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal DurationHours { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string CorrectiveAction { get; set; } = string.Empty;
}

public class EquipmentObservationDto
{
    public int Id { get; set; }
    public string EquipmentName { get; set; } = string.Empty;
    public decimal NoiseLevel { get; set; }
    public string VibrationObservation { get; set; } = string.Empty;
    public string TemperatureObservation { get; set; } = string.Empty;
    public string GeneralCondition { get; set; } = string.Empty;
}

public class SheqObservationDto
{
    public int Incidents { get; set; }
    public int NearMisses { get; set; }
    public string? SafetyObservations { get; set; }
    public string? EnvironmentalObservations { get; set; }
    public decimal AirQualityScore { get; set; }
    public decimal DustLevel { get; set; }
    public decimal HeatIndex { get; set; }
}

public class UndergroundReadingDto
{
    public int TruckloadsExcavated { get; set; }
    public decimal OxygenLevelStart { get; set; }
    public decimal OxygenLevelMidshift { get; set; }
    public decimal OxygenLevelFinish { get; set; }
    public decimal DustLevel { get; set; }
    public string Visibility { get; set; } = string.Empty;
    public int Incidents { get; set; }
    public string? IncidentDescriptions { get; set; }
}

public class ShiftHandoverDto
{
    public string MajorEvents { get; set; } = string.Empty;
    public string EquipmentIssues { get; set; } = string.Empty;
    public string SafetyConcerns { get; set; } = string.Empty;
    public string ProductionConcerns { get; set; } = string.Empty;
    public string OutstandingActions { get; set; } = string.Empty;
    public string GeneralNotes { get; set; } = string.Empty;
}