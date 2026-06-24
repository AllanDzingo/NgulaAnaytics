using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Models;

namespace NgulAnalytics.Api.Data;

public class NgulAnalyticsDbContext : DbContext
{
    public NgulAnalyticsDbContext(DbContextOptions<NgulAnalyticsDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<EquipmentCategory> EquipmentCategories => Set<EquipmentCategory>();
    public DbSet<Equipment> Equipment => Set<Equipment>();
    public DbSet<ShiftReport> ShiftReports => Set<ShiftReport>();
    public DbSet<ProductionEntry> ProductionEntries => Set<ProductionEntry>();
    public DbSet<DowntimeEntry> DowntimeEntries => Set<DowntimeEntry>();
    public DbSet<EquipmentObservation> EquipmentObservations => Set<EquipmentObservation>();
    public DbSet<SheqObservation> SheqObservations => Set<SheqObservation>();
    public DbSet<UndergroundReading> UndergroundReadings => Set<UndergroundReading>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();
    public DbSet<ProductionTarget> ProductionTargets => Set<ProductionTarget>();
    public DbSet<ShiftHandover> ShiftHandovers => Set<ShiftHandover>();
    public DbSet<Models.Action> Actions => Set<Models.Action>();
    public DbSet<ActionComment> ActionComments => Set<ActionComment>();
    public DbSet<Alert> Alerts => Set<Alert>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // UserRole composite key
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        // ShiftReport relationships
        modelBuilder.Entity<ShiftReport>()
            .HasOne(sr => sr.Supervisor)
            .WithMany(u => u.ShiftReports)
            .HasForeignKey(sr => sr.SupervisorId);

        modelBuilder.Entity<ShiftReport>()
            .HasOne(sr => sr.Section)
            .WithMany(s => s.ShiftReports)
            .HasForeignKey(sr => sr.SectionId);

        // ShiftHandover 1:1 with ShiftReport
        modelBuilder.Entity<ShiftHandover>()
            .HasOne(sh => sh.ShiftReport)
            .WithOne(sr => sr.ShiftHandover)
            .HasForeignKey<ShiftHandover>(sh => sh.ShiftReportId);

        // Action relationships
        modelBuilder.Entity<Models.Action>()
            .HasOne(a => a.AssignedTo)
            .WithMany(u => u.AssignedActions)
            .HasForeignKey(a => a.AssignedToId);

        modelBuilder.Entity<Models.Action>()
            .HasOne(a => a.CreatedBy)
            .WithMany(u => u.CreatedActions)
            .HasForeignKey(a => a.CreatedById);

        modelBuilder.Entity<Models.Action>()
            .HasOne(a => a.Equipment)
            .WithMany(e => e.Actions)
            .HasForeignKey(a => a.EquipmentId);

        // Seed roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Executive", Description = "Executive Management" },
            new Role { Id = 2, Name = "Engineering", Description = "Engineering Manager" },
            new Role { Id = 3, Name = "Production", Description = "Production Manager" },
            new Role { Id = 4, Name = "SHEQ", Description = "SHEQ Officer" },
            new Role { Id = 5, Name = "Supervisor", Description = "Shift Supervisor" }
        );

        // Seed sections
        modelBuilder.Entity<Section>().HasData(
            new Section { Id = 1, Name = "Primary Crushing", Type = "Surface", Description = "Primary ore crushing" },
            new Section { Id = 2, Name = "Secondary Crushing", Type = "Surface", Description = "Secondary ore crushing" },
            new Section { Id = 3, Name = "Milling", Type = "Surface", Description = "Ore milling and grinding" },
            new Section { Id = 4, Name = "Flotation", Type = "Surface", Description = "Mineral flotation separation" },
            new Section { Id = 5, Name = "Tailings", Type = "Surface", Description = "Tailings processing and storage" },
            new Section { Id = 6, Name = "Underground", Type = "Underground", Description = "Underground mining operations" }
        );

        // Seed equipment categories
        modelBuilder.Entity<EquipmentCategory>().HasData(
            new EquipmentCategory { Id = 1, Name = "Crusher" },
            new EquipmentCategory { Id = 2, Name = "Mill" },
            new EquipmentCategory { Id = 3, Name = "Pump" },
            new EquipmentCategory { Id = 4, Name = "Conveyor" },
            new EquipmentCategory { Id = 5, Name = "Compressor" },
            new EquipmentCategory { Id = 6, Name = "Haul Truck" },
            new EquipmentCategory { Id = 7, Name = "Drill Rig" },
            new EquipmentCategory { Id = 8, Name = "Ventilation Fan" }
        );
    }
}