using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class addSprints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Sprints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sprints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SprintItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SprintId = table.Column<Guid>(type: "uuid", nullable: false),
                    DemandId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlannedHours = table.Column<double>(type: "double precision", nullable: false),
                    WorkedHours = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SprintItems_Demands_DemandId",
                        column: x => x.DemandId,
                        principalTable: "Demands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SprintItems_Sprints_SprintId",
                        column: x => x.SprintId,
                        principalTable: "Sprints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 1, 1, 12, 55, 947, DateTimeKind.Utc).AddTicks(7787), "$2a$11$DpD0tLDCy6O0TT9A/U6sguR1Wj6AdY6JVZk9rrSmwV71NHxDtinky" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 1, 1, 12, 56, 306, DateTimeKind.Utc).AddTicks(3156), "$2a$11$GsKL451NBXX7OagZ5zQR/.oVCfIe0su04q8JMO3x13theTQez8Mxy" });

            migrationBuilder.CreateIndex(
                name: "IX_SprintItems_DemandId",
                table: "SprintItems",
                column: "DemandId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintItems_SprintId_DemandId",
                table: "SprintItems",
                columns: new[] { "SprintId", "DemandId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sprints_Name",
                table: "Sprints",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Sprints_StartDate_EndDate",
                table: "Sprints",
                columns: new[] { "StartDate", "EndDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SprintItems");

            migrationBuilder.DropTable(
                name: "Sprints");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 30, 18, 37, 24, 591, DateTimeKind.Utc).AddTicks(7270), "$2a$11$WOpj69Lr8bOZx4pcexBL9uVbazwvkO0bjOEU6t/NaJYin1uikSxnG" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 30, 18, 37, 24, 862, DateTimeKind.Utc).AddTicks(8159), "$2a$11$pXqilw3CUY8M3QV0X2Lo.OhS1gRdZRs/tN1IBLbBj3Qv3IymJZk52" });
        }
    }
}
