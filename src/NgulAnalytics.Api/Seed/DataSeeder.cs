using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.Models;

namespace NgulAnalytics.Api.Seed;

public static class DataSeeder
{
    public static async Task SeedInitialDataAsync(NgulAnalyticsDbContext db)
    {
        // Only seed if data doesn't exist
        if (db.Users.Any() || db.Roles.Any())
            return;

        // Create Roles
        var roles = new[]
        {
            new Role { Name = RoleNames.Executive, Description = "Executive Management" },
            new Role { Name = RoleNames.EngineeringManager, Description = "Engineering Manager" },
            new Role { Name = RoleNames.ProductionManager, Description = "Production Manager" },
            new Role { Name = RoleNames.SheqOfficer, Description = "SHEQ Officer" },
            new Role { Name = RoleNames.ShiftSupervisor, Description = "Shift Supervisor" }
        };

        db.Roles.AddRange(roles);
        await db.SaveChangesAsync();

        // Create demo users with hashed passwords (all use Demo@2025)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Demo@2025");

        var users = new[]
        {
            new User
            {
                Email = "exec@ngula.demo",
                PasswordHash = passwordHash,
                FullName = "Executive Dashboard",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Email = "engineer@ngula.demo",
                PasswordHash = passwordHash,
                FullName = "Engineering Manager",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Email = "production@ngula.demo",
                PasswordHash = passwordHash,
                FullName = "Production Manager",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Email = "sheq@ngula.demo",
                PasswordHash = passwordHash,
                FullName = "SHEQ Officer",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Email = "supervisor@ngula.demo",
                PasswordHash = passwordHash,
                FullName = "Shift Supervisor",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        db.Users.AddRange(users);
        await db.SaveChangesAsync();

        // Assign roles to users
        var roleMap = new Dictionary<string, string>
        {
            ["exec@ngula.demo"] = RoleNames.Executive,
            ["engineer@ngula.demo"] = RoleNames.EngineeringManager,
            ["production@ngula.demo"] = RoleNames.ProductionManager,
            ["sheq@ngula.demo"] = RoleNames.SheqOfficer,
            ["supervisor@ngula.demo"] = RoleNames.ShiftSupervisor
        };

        foreach (var user in users)
        {
            var role = db.Roles.First(r => r.Name == roleMap[user.Email]);
            var userRole = new UserRole { UserId = user.Id, RoleId = role.Id };
            db.UserRoles.Add(userRole);
        }

        await db.SaveChangesAsync();

        // Create Equipment Categories
        var categories = new[]
        {
            new EquipmentCategory { Name = "Crusher" },
            new EquipmentCategory { Name = "Mill" },
            new EquipmentCategory { Name = "Pump" },
            new EquipmentCategory { Name = "Conveyor" },
            new EquipmentCategory { Name = "Compressor" },
            new EquipmentCategory { Name = "Excavator" },
            new EquipmentCategory { Name = "Ventilation" }
        };

        db.EquipmentCategories.AddRange(categories);
        await db.SaveChangesAsync();

        // Create Sections
        var sections = new[]
        {
            new Section { Name = "Primary Crushing", Type = "Surface", Description = "Primary crushing stage" },
            new Section { Name = "Secondary Crushing", Type = "Surface", Description = "Secondary crushing stage" },
            new Section { Name = "Milling", Type = "Surface", Description = "Milling operations" },
            new Section { Name = "Flotation", Type = "Surface", Description = "Flotation processing" },
            new Section { Name = "Tailings", Type = "Surface", Description = "Tailings handling" },
            new Section { Name = "Underground", Type = "Underground", Description = "Underground mining operations" }
        };

        db.Sections.AddRange(sections);
        await db.SaveChangesAsync();

        // Create Equipment for each section
        var equipment = new List<Equipment>
        {
            // Primary Crushing
            new Equipment
            {
                Name = "Primary Crusher 1",
                CategoryId = categories[0].Id,
                SectionId = sections[0].Id,
                Manufacturer = "Metso",
                Model = "C140",
                ServiceIntervalHours = 500,
                CurrentOperatingHours = 12450,
                CommissionDate = new DateTime(2015, 3, 15),
                Status = EquipmentStatus.Running
            },
            new Equipment
            {
                Name = "Primary Crusher 2",
                CategoryId = categories[0].Id,
                SectionId = sections[0].Id,
                Manufacturer = "Sandvik",
                Model = "CH660",
                ServiceIntervalHours = 500,
                CurrentOperatingHours = 11820,
                CommissionDate = new DateTime(2016, 7, 22),
                Status = EquipmentStatus.Running
            },

            // Secondary Crushing
            new Equipment
            {
                Name = "Cone Crusher 1",
                CategoryId = categories[0].Id,
                SectionId = sections[1].Id,
                Manufacturer = "Metso",
                Model = "HP5",
                ServiceIntervalHours = 400,
                CurrentOperatingHours = 9876,
                CommissionDate = new DateTime(2018, 5, 10),
                Status = EquipmentStatus.Running
            },

            // Milling
            new Equipment
            {
                Name = "Ball Mill 1",
                CategoryId = categories[1].Id,
                SectionId = sections[2].Id,
                Manufacturer = "FLS Smith",
                Model = "MQ 2.6x3.6",
                ServiceIntervalHours = 750,
                CurrentOperatingHours = 18900,
                CommissionDate = new DateTime(2012, 11, 8),
                Status = EquipmentStatus.Running
            },
            new Equipment
            {
                Name = "Ball Mill 2",
                CategoryId = categories[1].Id,
                SectionId = sections[2].Id,
                Manufacturer = "FLS Smith",
                Model = "MQ 2.6x3.6",
                ServiceIntervalHours = 750,
                CurrentOperatingHours = 17650,
                CommissionDate = new DateTime(2014, 1, 20),
                Status = EquipmentStatus.Running
            },

            // Flotation
            new Equipment
            {
                Name = "Flotation Cell A",
                CategoryId = categories[4].Id,
                SectionId = sections[3].Id,
                Manufacturer = "Outotec",
                Model = "OK 75",
                ServiceIntervalHours = 600,
                CurrentOperatingHours = 14500,
                CommissionDate = new DateTime(2017, 2, 14),
                Status = EquipmentStatus.Running
            },
            new Equipment
            {
                Name = "Flotation Cell B",
                CategoryId = categories[4].Id,
                SectionId = sections[3].Id,
                Manufacturer = "Outotec",
                Model = "OK 75",
                ServiceIntervalHours = 600,
                CurrentOperatingHours = 14200,
                CommissionDate = new DateTime(2017, 2, 14),
                Status = EquipmentStatus.Running
            },

            // Tailings
            new Equipment
            {
                Name = "Tailings Pump 1",
                CategoryId = categories[2].Id,
                SectionId = sections[4].Id,
                Manufacturer = "Sulzer",
                Model = "ACP 1000-500",
                ServiceIntervalHours = 300,
                CurrentOperatingHours = 8900,
                CommissionDate = new DateTime(2019, 8, 30),
                Status = EquipmentStatus.Running
            },

            // Underground
            new Equipment
            {
                Name = "Underground Excavator 1",
                CategoryId = categories[5].Id,
                SectionId = sections[5].Id,
                Manufacturer = "Caterpillar",
                Model = "320D",
                ServiceIntervalHours = 1000,
                CurrentOperatingHours = 24500,
                CommissionDate = new DateTime(2010, 6, 1),
                Status = EquipmentStatus.Running
            },
            new Equipment
            {
                Name = "Underground Ventilation Fan",
                CategoryId = categories[6].Id,
                SectionId = sections[5].Id,
                Manufacturer = "Howden",
                Model = "HV-2000",
                ServiceIntervalHours = 2000,
                CurrentOperatingHours = 45600,
                CommissionDate = new DateTime(2008, 3, 15),
                Status = EquipmentStatus.Running
            }
        };

        db.Equipment.AddRange(equipment);
        await db.SaveChangesAsync();

        // Create Production Targets for this year and next
        var year = DateTime.UtcNow.Year;
        var targetData = new[]
        {
            (sections[0].Id, "Primary Crushing", 8000m, 0m, 0m, 0m, null),
            (sections[1].Id, "Secondary Crushing", 7500m, 0m, 0m, 0m, null),
            (sections[2].Id, "Milling", 5000m, 6000m, 85m, 2.5m, null),
            (sections[3].Id, "Flotation", 0m, 4500m, 88m, 8.5m, null),
            (sections[4].Id, "Tailings", 5500m, 5500m, 0m, 0m, null),
            (sections[5].Id, "Underground", 0m, 0m, 0m, 0m, 400)
        };

        foreach (var (sectionId, _, tons, milled, recovery, grade, truckloads) in targetData)
        {
            for (int month = 1; month <= 12; month++)
            {
                var target = new ProductionTarget
                {
                    SectionId = sectionId,
                    Year = year,
                    Month = month,
                    TargetTonsCrushed = tons,
                    TargetTonsMilled = milled,
                    TargetRecovery = recovery,
                    TargetGrade = grade,
                    TargetTruckloads = (int?)truckloads
                };
                db.ProductionTargets.Add(target);
            }
        }

        await db.SaveChangesAsync();
    }
}
