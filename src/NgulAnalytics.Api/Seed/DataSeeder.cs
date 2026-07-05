// src/NgulAnalytics.Api/Seed/DataSeeder.cs
using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.Models;
using System.Security.Cryptography;
using System.Text;

namespace NgulAnalytics.Api.Seed;

public class DataSeeder
{
    private readonly NgulAnalyticsDbContext _context;
    private readonly Random _random = new();

    public DataSeeder(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        await _context.Database.MigrateAsync();

        if (await _context.Users.AnyAsync()) return; // Already seeded

        await SeedRolesAsync();
        await SeedUsersAsync();
        await SeedSectionsAsync();
        await SeedEquipmentCategoriesAsync();
        await SeedEquipmentAsync();
        await SeedProductionTargetsAsync();
        await SeedShiftReportsAsync();
        await SeedMaintenanceRecordsAsync();
        await SeedActionsAsync();
        await SeedAlertsAsync();

        await _context.SaveChangesAsync();
    }

    private async Task SeedRolesAsync()
    {
        var roles = new[]
        {
            new Role { Name = "Executive", Description = "Executive Management" },
            new Role { Name = "Engineering", Description = "Engineering Manager" },
            new Role { Name = "Production", Description = "Production Manager" },
            new Role { Name = "SHEQ", Description = "SHEQ Officer" },
            new Role { Name = "Supervisor", Description = "Shift Supervisor" }
        };
        await _context.Roles.AddRangeAsync(roles);
        await _context.SaveChangesAsync();
    }

    private async Task SeedUsersAsync()
    {
        var users = new[]
        {
            CreateUser("exec@ngula.demo", "Executive Management", "Executive"),
            CreateUser("engineer@ngula.demo", "Engineering Manager", "Engineering"),
            CreateUser("production@ngula.demo", "Production Manager", "Production"),
            CreateUser("sheq@ngula.demo", "SHEQ Officer", "SHEQ"),
            CreateUser("supervisor@ngula.demo", "Shift Supervisor", "Supervisor")
        };

        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        var roles = await _context.Roles.ToListAsync();
        var userRoles = users.SelectMany(u => roles
            .Where(r => r.Name == u.Role)
            .Select(r => new UserRole { UserId = u.Id, RoleId = r.Id }));

        await _context.UserRoles.AddRangeAsync(userRoles);
        await _context.SaveChangesAsync();
    }

    private User CreateUser(string email, string fullName, string role)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@2025"),
            FullName = fullName,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-12)
        };
    }

    private async Task SeedSectionsAsync()
    {
        var sections = new[]
        {
            new Section { Name = "Primary Crushing", Type = "Surface", Description = "Primary ore crushing and sizing" },
            new Section { Name = "Secondary Crushing", Type = "Surface", Description = "Secondary crushing and screening" },
            new Section { Name = "Milling", Type = "Surface", Description = "Grinding and milling operations" },
            new Section { Name = "Flotation", Type = "Surface", Description = "Mineral flotation separation" },
            new Section { Name = "Tailings", Type = "Surface", Description = "Tailings processing and management" },
            new Section { Name = "Underground", Type = "Underground", Description = "Underground mining operations" }
        };
        await _context.Sections.AddRangeAsync(sections);
        await _context.SaveChangesAsync();
    }

    private async Task SeedEquipmentCategoriesAsync()
    {
        var categories = new[]
        {
            new EquipmentCategory { Name = "Crusher" },
            new EquipmentCategory { Name = "Mill" },
            new EquipmentCategory { Name = "Pump" },
            new EquipmentCategory { Name = "Conveyor" },
            new EquipmentCategory { Name = "Compressor" },
            new EquipmentCategory { Name = "Excavator" },
            new EquipmentCategory { Name = "Ventilation Fan" },
            new EquipmentCategory { Name = "Haul Truck" }
        };
        await _context.EquipmentCategories.AddRangeAsync(categories);
        await _context.SaveChangesAsync();
    }

    private async Task SeedEquipmentAsync()
    {
        var sections = await _context.Sections.ToListAsync();
        var categories = await _context.EquipmentCategories.ToListAsync();

        var equipment = new List<Equipment>
        {
            // Primary Crushing
            new() { Name = "Primary Crusher 1", CategoryId = categories.First(c => c.Name == "Crusher").Id, SectionId = sections.First(s => s.Name == "Primary Crushing").Id, Manufacturer = "Metso Outotec", Model = "C160", ServiceIntervalHours = 2000, CurrentOperatingHours = 15420, CommissionDate = new DateTime(2019, 3, 15), Status = "Operational" },
            new() { Name = "Primary Crusher 2", CategoryId = categories.First(c => c.Name == "Crusher").Id, SectionId = sections.First(s => s.Name == "Primary Crushing").Id, Manufacturer = "Metso Outotec", Model = "C130", ServiceIntervalHours = 2000, CurrentOperatingHours = 12300, CommissionDate = new DateTime(2020, 7, 10), Status = "Operational" },
            new() { Name = "Feed Conveyor A", CategoryId = categories.First(c => c.Name == "Conveyor").Id, SectionId = sections.First(s => s.Name == "Primary Crushing").Id, Manufacturer = "Sandvik", Model = "CV-800", ServiceIntervalHours = 1500, CurrentOperatingHours = 18900, CommissionDate = new DateTime(2018, 5, 20), Status = "Operational" },

            // Secondary Crushing
            new() { Name = "Secondary Crusher 1", CategoryId = categories.First(c => c.Name == "Crusher").Id, SectionId = sections.First(s => s.Name == "Secondary Crushing").Id, Manufacturer = "Metso Outotec", Model = "HP500", ServiceIntervalHours = 2000, CurrentOperatingHours = 14200, CommissionDate = new DateTime(2019, 8, 1), Status = "Operational" },
            new() { Name = "Secondary Crusher 2", CategoryId = categories.First(c => c.Name == "Crusher").Id, SectionId = sections.First(s => s.Name == "Secondary Crushing").Id, Manufacturer = "Metso Outotec", Model = "HP400", ServiceIntervalHours = 2000, CurrentOperatingHours = 9800, CommissionDate = new DateTime(2021, 2, 15), Status = "Under Maintenance" },
            new() { Name = "Screening Conveyor B", CategoryId = categories.First(c => c.Name == "Conveyor").Id, SectionId = sections.First(s => s.Name == "Secondary Crushing").Id, Manufacturer = "Sandvik", Model = "CV-600", ServiceIntervalHours = 1500, CurrentOperatingHours = 21000, CommissionDate = new DateTime(2017, 11, 10), Status = "Operational" },

            // Milling
            new() { Name = "SAG Mill 1", CategoryId = categories.First(c => c.Name == "Mill").Id, SectionId = sections.First(s => s.Name == "Milling").Id, Manufacturer = "FLSmidth", Model = "SAG-9.75m", ServiceIntervalHours = 3000, CurrentOperatingHours = 25600, CommissionDate = new DateTime(2017, 1, 20), Status = "Operational" },
            new() { Name = "Ball Mill 1", CategoryId = categories.First(c => c.Name == "Mill").Id, SectionId = sections.First(s => s.Name == "Milling").Id, Manufacturer = "FLSmidth", Model = "BM-5.5m", ServiceIntervalHours = 3000, CurrentOperatingHours = 24800, CommissionDate = new DateTime(2017, 3, 15), Status = "Operational" },
            new() { Name = "Ball Mill 2", CategoryId = categories.First(c => c.Name == "Mill").Id, SectionId = sections.First(s => s.Name == "Milling").Id, Manufacturer = "FLSmidth", Model = "BM-5.5m", ServiceIntervalHours = 3000, CurrentOperatingHours = 19800, CommissionDate = new DateTime(2019, 6, 1), Status = "Operational" },
            new() { Name = "Mill Pump 1", CategoryId = categories.First(c => c.Name == "Pump").Id, SectionId = sections.First(s => s.Name == "Milling").Id, Manufacturer = "Weir Minerals", Model = "Warman 12/10", ServiceIntervalHours = 1500, CurrentOperatingHours = 17500, CommissionDate = new DateTime(2018, 9, 10), Status = "Operational" },
            new() { Name = "Mill Pump 2", CategoryId = categories.First(c => c.Name == "Pump").Id, SectionId = sections.First(s => s.Name == "Milling").Id, Manufacturer = "Weir Minerals", Model = "Warman 12/10", ServiceIntervalHours = 1500, CurrentOperatingHours = 8200, CommissionDate = new DateTime(2021, 5, 20), Status = "Operational" },

            // Flotation
            new() { Name = "Flotation Cell Bank A", CategoryId = categories.First(c => c.Name == "Pump").Id, SectionId = sections.First(s => s.Name == "Flotation").Id, Manufacturer = "Outotec", Model = "OK-300", ServiceIntervalHours = 2000, CurrentOperatingHours = 22100, CommissionDate = new DateTime(2017, 7, 15), Status = "Operational" },
            new() { Name = "Flotation Cell Bank B", CategoryId = categories.First(c => c.Name == "Pump").Id, SectionId = sections.First(s => s.Name == "Flotation").Id, Manufacturer = "Outotec", Model = "OK-300", ServiceIntervalHours = 2000, CurrentOperatingHours = 18500, CommissionDate = new DateTime(2018, 4, 20), Status = "Operational" },
            new() { Name = "Concentrate Pump 1", CategoryId = categories.First(c => c.Name == "Pump").Id, SectionId = sections.First(s => s.Name == "Flotation").Id, Manufacturer = "Weir Minerals", Model = "Warman 8/6", ServiceIntervalHours = 1500, CurrentOperatingHours = 19200, CommissionDate = new DateTime(2018, 2, 1), Status = "Operational" },

            // Tailings
            new() { Name = "Tailings Pump 1", CategoryId = categories.First(c => c.Name == "Pump").Id, SectionId = sections.First(s => s.Name == "Tailings").Id, Manufacturer = "Weir Minerals", Model = "Warman 16/14", ServiceIntervalHours = 1500, CurrentOperatingHours = 23400, CommissionDate = new DateTime(2016, 11, 15), Status = "Operational" },
            new() { Name = "Tailings Pump 2", CategoryId = categories.First(c => c.Name == "Pump").Id, SectionId = sections.First(s => s.Name == "Tailings").Id, Manufacturer = "Weir Minerals", Model = "Warman 16/14", ServiceIntervalHours = 1500, CurrentOperatingHours = 15600, CommissionDate = new DateTime(2019, 1, 10), Status = "Operational" },
            new() { Name = "Compressor Station 1", CategoryId = categories.First(c => c.Name == "Compressor").Id, SectionId = sections.First(s => s.Name == "Tailings").Id, Manufacturer = "Atlas Copco", Model = "GA-250", ServiceIntervalHours = 2000, CurrentOperatingHours = 26700, CommissionDate = new DateTime(2016, 6, 1), Status = "Operational" },

            // Underground
            new() { Name = "UG Excavator 1", CategoryId = categories.First(c => c.Name == "Excavator").Id, SectionId = sections.First(s => s.Name == "Underground").Id, Manufacturer = "Sandvik", Model = "DL421", ServiceIntervalHours = 1000, CurrentOperatingHours = 8900, CommissionDate = new DateTime(2020, 3, 15), Status = "Operational" },
            new() { Name = "UG Excavator 2", CategoryId = categories.First(c => c.Name == "Excavator").Id, SectionId = sections.First(s => s.Name == "Underground").Id, Manufacturer = "Sandvik", Model = "DL421", ServiceIntervalHours = 1000, CurrentOperatingHours = 6200, CommissionDate = new DateTime(2021, 8, 1), Status = "Operational" },
            new() { Name = "Ventilation Fan 1", CategoryId = categories.First(c => c.Name == "Ventilation Fan").Id, SectionId = sections.First(s => s.Name == "Underground").Id, Manufacturer = "Howden", Model = "AF-2000", ServiceIntervalHours = 1500, CurrentOperatingHours = 31200, CommissionDate = new DateTime(2015, 9, 20), Status = "Operational" },
            new() { Name = "Ventilation Fan 2", CategoryId = categories.First(c => c.Name == "Ventilation Fan").Id, SectionId = sections.First(s => s.Name == "Underground").Id, Manufacturer = "Howden", Model = "AF-2000", ServiceIntervalHours = 1500, CurrentOperatingHours = 27800, CommissionDate = new DateTime(2016, 4, 10), Status = "Operational" },
            new() { Name = "UG Haul Truck 1", CategoryId = categories.First(c => c.Name == "Haul Truck").Id, SectionId = sections.First(s => s.Name == "Underground").Id, Manufacturer = "Sandvik", Model = "TH545i", ServiceIntervalHours = 1200, CurrentOperatingHours = 10500, CommissionDate = new DateTime(2019, 11, 1), Status = "Operational" },
            new() { Name = "UG Haul Truck 2", CategoryId = categories.First(c => c.Name == "Haul Truck").Id, SectionId = sections.First(s => s.Name == "Underground").Id, Manufacturer = "Sandvik", Model = "TH545i", ServiceIntervalHours = 1200, CurrentOperatingHours = 7800, CommissionDate = new DateTime(2020, 12, 15), Status = "Down" },
            new() { Name = "UG Compressor", CategoryId = categories.First(c => c.Name == "Compressor").Id, SectionId = sections.First(s => s.Name == "Underground").Id, Manufacturer = "Atlas Copco", Model = "GA-132", ServiceIntervalHours = 2000, CurrentOperatingHours = 14500, CommissionDate = new DateTime(2019, 5, 20), Status = "Operational" }
        };

        await _context.Equipment.AddRangeAsync(equipment);
        await _context.SaveChangesAsync();
    }

    private async Task SeedProductionTargetsAsync()
    {
        var sections = await _context.Sections.ToListAsync();
        var now = DateTime.UtcNow;

        var targets = new List<ProductionTarget>();
        foreach (var section in sections)
        {
            for (int monthOffset = -11; monthOffset <= 1; monthOffset++)
            {
                var targetDate = now.AddMonths(monthOffset);
                targets.Add(new ProductionTarget
                {
                    SectionId = section.Id,
                    Year = targetDate.Year,
                    Month = targetDate.Month,
                    TargetTonsCrushed = section.Name.Contains("Crushing") ? 45000 + _random.Next(-5000, 5000) : 0,
                    TargetTonsMilled = section.Name == "Milling" ? 38000 + _random.Next(-4000, 4000) : 0,
                    TargetRecovery = section.Name == "Flotation" ? 92 + (decimal)(_random.NextDouble() * 4 - 2) : 0,
                    TargetGrade = section.Name == "Flotation" ? 3.5m + (decimal)(_random.NextDouble() * 0.5 - 0.25) : 0,
                    TargetTruckloads = section.Name == "Underground" ? 120 + _random.Next(-20, 20) : 0
                });
            }
        }

        await _context.ProductionTargets.AddRangeAsync(targets);
        await _context.SaveChangesAsync();
    }

    private async Task SeedShiftReportsAsync()
    {
        var sections = await _context.Sections.ToListAsync();
        var equipment = await _context.Equipment.ToListAsync();
        var supervisors = await _context.Users.Where(u => u.Role == "Supervisor").ToListAsync();
        var shifts = new[] { "DAY", "AFT", "NGT" };

        var startDate = DateTime.UtcNow.AddMonths(-12).Date;
        var endDate = DateTime.UtcNow.Date;

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            foreach (var shift in shifts)
            {
                foreach (var section in sections)
                {
                    var supervisor = supervisors[_random.Next(supervisors.Count)];
                    var report = new ShiftReport
                    {
                        Date = date,
                        Shift = shift,
                        SupervisorId = supervisor.Id,
                        SectionId = section.Id,
                        Status = _random.Next(10) < 8 ? "Approved" : "Submitted",
                        SubmittedAt = date.AddHours(shift == "DAY" ? 6 : shift == "AFT" ? 14 : 22).AddMinutes(_random.Next(60)),
                        ApprovedAt = _random.Next(10) < 8 ? date.AddHours(shift == "DAY" ? 10 : shift == "AFT" ? 18 : 6).AddMinutes(_random.Next(60)) : null
                    };

                    _context.ShiftReports.Add(report);
                    await _context.SaveChangesAsync();

                    // Production Entry
                    var productionEntry = new ProductionEntry
                    {
                        ShiftReportId = report.Id,
                        TonsCrushed = section.Name.Contains("Crushing") ? 14000 + (decimal)(_random.NextDouble() * 4000 - 2000) : 0,
                        TonsMilled = section.Name == "Milling" ? 12000 + (decimal)(_random.NextDouble() * 3000 - 1500) : 0,
                        FeedGrade = section.Name == "Milling" ? 2.8m + (decimal)(_random.NextDouble() * 0.6 - 0.3) : 0,
                        RecoveryPercentage = section.Name == "Flotation" ? 88 + (decimal)(_random.NextDouble() * 8 - 4) : 0,
                        ConcentrateProduced = section.Name == "Flotation" ? 850 + (decimal)(_random.NextDouble() * 200 - 100) : 0,
                        Comments = _random.Next(5) == 0 ? "Normal operations" : string.Empty
                    };
                    _context.ProductionEntries.Add(productionEntry);

                    // Downtime Entries (30% chance)
                    if (_random.Next(10) < 3)
                    {
                        var sectionEquipment = equipment.Where(e => e.SectionId == section.Id).ToList();
                        if (sectionEquipment.Any())
                        {
                            var eq = sectionEquipment[_random.Next(sectionEquipment.Count)];
                            var startTime = report.SubmittedAt.AddHours(_random.Next(4));
                            var duration = 0.5m + (decimal)(_random.NextDouble() * 4);
                            _context.DowntimeEntries.Add(new DowntimeEntry
                            {
                                ShiftReportId = report.Id,
                                EquipmentId = eq.Id,
                                StartTime = startTime,
                                EndTime = startTime.AddHours((double)duration),
                                DurationHours = duration,
                                Reason = GetRandomDowntimeReason(),
                                RootCause = GetRandomRootCause(),
                                CorrectiveAction = "Repaired and returned to service"
                            });
                        }
                    }

                    // Equipment Observations
                    var obsEquipment = equipment.Where(e => e.SectionId == section.Id).Take(3).ToList();
                    foreach (var eq in obsEquipment)
                    {
                        _context.EquipmentObservations.Add(new EquipmentObservation
                        {
                            ShiftReportId = report.Id,
                            EquipmentId = eq.Id,
                            NoiseLevel = 65 + (decimal)(_random.NextDouble() * 30),
                            VibrationObservation = _random.Next(5) == 0 ? "Elevated" : "Normal",
                            TemperatureObservation = _random.Next(10) == 0 ? "Above normal" : "Normal",
                            GeneralCondition = _random.Next(10) < 7 ? "Good" : _random.Next(2) == 0 ? "Fair" : "Poor"
                        });
                    }

                    // SHEQ Observations
                    _context.SheqObservations.Add(new SheqObservation
                    {
                        ShiftReportId = report.Id,
                        Incidents = _random.Next(3),
                        NearMisses = _random.Next(5),
                        SafetyObservations = _random.Next(5) == 0 ? "All PPE compliance maintained" : string.Empty,
                        EnvironmentalObservations = _random.Next(5) == 0 ? "No environmental incidents" : string.Empty,
                        AirQualityScore = 85 + (decimal)(_random.NextDouble() * 15),
                        DustLevel = (decimal)(_random.NextDouble() * 2),
                        HeatIndex = 22 + (decimal)(_random.NextDouble() * 8)
                    });

                    // Underground Readings
                    if (section.Name == "Underground")
                    {
                        var oxygenStart = 19.5m + (decimal)(_random.NextDouble() * 1.5);
                        var oxygenMid = 19.5m + (decimal)(_random.NextDouble() * 1.5);
                        var oxygenFinish = 19.5m + (decimal)(_random.NextDouble() * 1.5);

                        // Occasionally create critical oxygen readings
                        if (_random.Next(20) == 0) oxygenStart = 18.5m + (decimal)(_random.NextDouble() * 0.8);
                        if (_random.Next(20) == 0) oxygenMid = 18.5m + (decimal)(_random.NextDouble() * 0.8);

                        _context.UndergroundReadings.Add(new UndergroundReading
                        {
                            ShiftReportId = report.Id,
                            TruckloadsExcavated = 30 + _random.Next(60),
                            OxygenLevelStart = oxygenStart,
                            OxygenLevelMidshift = oxygenMid,
                            OxygenLevelFinish = oxygenFinish,
                            DustLevel = (decimal)(_random.NextDouble() * 3),
                            Visibility = (Visibility)_random.Next(4),
                            Incidents = _random.Next(3),
                            IncidentDescriptions = _random.Next(5) == 0 ? "Minor rock fall, no injuries" : null
                        });
                    }

                    // Shift Handover
                    if (_random.Next(10) < 8)
                    {
                        _context.ShiftHandovers.Add(new ShiftHandover
                        {
                            ShiftReportId = report.Id,
                            MajorEvents = GetRandomMajorEvent(),
                            EquipmentIssues = _random.Next(3) == 0 ? "All equipment operational" : GetRandomEquipmentIssue(),
                            SafetyConcerns = _random.Next(3) == 0 ? "No active safety concerns" : "Monitor dust levels in east drift",
                            ProductionConcerns = _random.Next(3) == 0 ? "On target" : "Feed grade slightly below target",
                            OutstandingActions = "Complete crusher inspection\nCheck mill liner wear",
                            GeneralNotes = "Normal shift operations"
                        });
                    }

                    await _context.SaveChangesAsync();
                }
            }
        }
    }

    private async Task SeedMaintenanceRecordsAsync()
    {
        var equipment = await _context.Equipment.ToListAsync();
        var engineers = await _context.Users.Where(u => u.Role == "Engineering").ToListAsync();

        foreach (var eq in equipment)
        {
            var serviceCount = (int)(eq.CurrentOperatingHours / eq.ServiceIntervalHours);
            for (int i = 1; i <= serviceCount; i++)
            {
                _context.MaintenanceRecords.Add(new MaintenanceRecord
                {
                    EquipmentId = eq.Id,
                    Type = i % 3 == 0 ? "Major Service" : "Routine Service",
                    Description = $"Scheduled {eq.ServiceIntervalHours}hr service",
                    PerformedAt = eq.CommissionDate.AddHours(eq.ServiceIntervalHours * i).AddDays(_random.Next(-5, 5)),
                    HoursAtService = eq.ServiceIntervalHours * i,
                    PerformedById = engineers[_random.Next(engineers.Count)].Id
                });
            }
        }
        await _context.SaveChangesAsync();
    }

    private async Task SeedActionsAsync()
    {
        var users = await _context.Users.ToListAsync();
        var equipment = await _context.Equipment.ToListAsync();

        var actions = new List<Models.Action>
        {
            new()
            {
                Title = "Investigate elevated noise on SAG Mill 1",
                Description = "Noise levels consistently above 85dB during night shift",
                Source = "Observation",
                SourceId = 1,
                Priority = "High",
                Status = "InProgress",
                AssignedToId = users.First(u => u.Role == "Engineering").Id,
                CreatedById = users.First(u => u.Role == "Supervisor").Id,
                EquipmentId = equipment.First(e => e.Name == "SAG Mill 1").Id,
                DueDate = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new()
            {
                Title = "CRITICAL: Low oxygen detected in Underground",
                Description = "Oxygen levels dropped to 18.8% during night shift. Immediate investigation required.",
                Source = "Incident",
                SourceId = 2,
                Priority = "Critical",
                Status = "Open",
                AssignedToId = users.First(u => u.Role == "SHEQ").Id,
                CreatedById = users.First(u => u.Role == "Supervisor").Id,
                DueDate = DateTime.UtcNow.AddDays(1),
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Title = "Review extended downtime on UG Haul Truck 2",
                Description = "Equipment has been down for 6 hours. Hydraulic system failure suspected.",
                Source = "Downtime",
                SourceId = 3,
                Priority = "High",
                Status = "Open",
                AssignedToId = users.First(u => u.Role == "Engineering").Id,
                CreatedById = users.First(u => u.Role == "Supervisor").Id,
                EquipmentId = equipment.First(e => e.Name == "UG Haul Truck 2").Id,
                DueDate = DateTime.UtcNow.AddDays(2),
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Title = "Complete crusher inspection",
                Description = "Outstanding from shift handover - inspect primary crusher wear plates",
                Source = "Handover",
                SourceId = 4,
                Priority = "Medium",
                Status = "Open",
                AssignedToId = users.First(u => u.Role == "Engineering").Id,
                CreatedById = users.First(u => u.Role == "Supervisor").Id,
                DueDate = DateTime.UtcNow.AddDays(3),
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Title = "Replace mill liner wear plates",
                Description = "Liner wear approaching critical threshold",
                Source = "Manual",
                SourceId = 5,
                Priority = "Medium",
                Status = "Closed",
                AssignedToId = users.First(u => u.Role == "Engineering").Id,
                CreatedById = users.First(u => u.Role == "Production").Id,
                DueDate = DateTime.UtcNow.AddDays(-2),
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                ClosedAt = DateTime.UtcNow.AddDays(-3)
            }
        };

        await _context.Actions.AddRangeAsync(actions);
        await _context.SaveChangesAsync();

        // Add comments
        var comments = new List<ActionComment>
        {
            new()
            {
                ActionId = actions[0].Id,
                UserId = users.First(u => u.Role == "Engineering").Id,
                Comment = "Scheduled vibration analysis for tomorrow",
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new()
            {
                ActionId = actions[2].Id,
                UserId = users.First(u => u.Role == "Engineering").Id,
                Comment = "Technician dispatched to site",
                CreatedAt = DateTime.UtcNow.AddHours(-4)
            }
        };

        await _context.ActionComments.AddRangeAsync(comments);
        await _context.SaveChangesAsync();
    }

    private async Task SeedAlertsAsync()
    {
        var equipment = await _context.Equipment.ToListAsync();

        var alerts = new List<Alert>
        {
            new()
            {
                Type = "Service Due",
                Severity = AlertSeverity.Warning,
                Title = "Service Due Soon",
                Message = "SAG Mill 1 service due within 50 operating hours",
                EquipmentId = equipment.First(e => e.Name == "SAG Mill 1").Id,
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Type = "Critical Health",
                Severity = AlertSeverity.Critical,
                Title = "Equipment Health Critical",
                Message = "UG Haul Truck 2 health score below 40%",
                EquipmentId = equipment.First(e => e.Name == "UG Haul Truck 2").Id,
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new()
            {
                Type = "Safety",
                Severity = AlertSeverity.Critical,
                Title = "Low Oxygen Alert",
                Message = "Underground oxygen level detected below 19.5%",
                EquipmentId = null,
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddHours(-6)
            },
            new()
            {
                Type = "Downtime",
                Severity = AlertSeverity.Warning,
                Title = "Extended Downtime",
                Message = "Secondary Crusher 2 has been under maintenance for 3 days",
                EquipmentId = equipment.First(e => e.Name == "Secondary Crusher 2").Id,
                IsRead = true,
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            }
        };

        await _context.Alerts.AddRangeAsync(alerts);
        await _context.SaveChangesAsync();
    }

    private static string GetRandomDowntimeReason() => new[]
    {
        "Mechanical failure", "Electrical fault", "Planned maintenance",
        "Belt slip", "Bearing overheating", "Hydraulic leak",
        "Control system fault", "Feed blockage"
    }[Random.Shared.Next(8)];

    private static string GetRandomRootCause() => new[]
    {
        "Wear and tear", "Operator error", "Design limitation",
        "Lack of preventive maintenance", "External factor",
        "Component fatigue", "Calibration drift"
    }[Random.Shared.Next(7)];

    private static string GetRandomMajorEvent() => new[]
    {
        "Normal production shift", "Power outage resolved within 30 minutes",
        "Feed grade exceeded expectations", "Minor conveyor belt adjustment",
        "All targets met", "Weather delay - 2 hours"
    }[Random.Shared.Next(6)];

    private static string GetRandomEquipmentIssue() => new[]
    {
        "Pump 2 running at reduced capacity",
        "Conveyor belt showing wear - monitor closely",
        "Crusher 1 vibrating above normal",
        "Mill liner wear approaching threshold",
        "Compressor cycling more frequently"
    }[Random.Shared.Next(5)];
}