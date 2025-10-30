using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class upgradeIndexs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateIndex(
                name: "IX_Demands_Classification",
                table: "Demands",
                column: "Classification");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_ModuleId_OpenedAt",
                table: "Demands",
                columns: new[] { "ModuleId", "OpenedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Demands_OccurrenceType",
                table: "Demands",
                column: "OccurrenceType");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_OpenedAt",
                table: "Demands",
                column: "OpenedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_Priority",
                table: "Demands",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_ReporterAreaId_OpenedAt",
                table: "Demands",
                columns: new[] { "ReporterAreaId", "OpenedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Demands_Responsible",
                table: "Demands",
                column: "Responsible");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_Status",
                table: "Demands",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_Status_OpenedAt",
                table: "Demands",
                columns: new[] { "Status", "OpenedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Demands_Classification",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_ModuleId_OpenedAt",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_OccurrenceType",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_OpenedAt",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_Priority",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_ReporterAreaId_OpenedAt",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_Responsible",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_Status",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_Status_OpenedAt",
                table: "Demands");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 30, 12, 52, 39, 476, DateTimeKind.Utc).AddTicks(1651), "$2a$11$agerhwh03YcsnFpojsm79.FpX1feifCeVaG9B1X50pl/eOtflr3mS" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 30, 12, 52, 39, 611, DateTimeKind.Utc).AddTicks(4544), "$2a$11$zA/nCe7CE0TXNbwKqs6IQ.QL7HcujwOWzBZ3hCiXKot34/fYxL59y" });
        }
    }
}
