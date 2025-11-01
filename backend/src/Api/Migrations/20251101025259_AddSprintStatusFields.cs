using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSprintStatusFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Sprints",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "SprintItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 1, 2, 52, 55, 254, DateTimeKind.Utc).AddTicks(3132), "$2a$11$rtrBxR3KEL2bUhIprBYVJ.8r7XqSUCh58CD0ygdyBXy8SxdEDZhnK" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 1, 2, 52, 55, 851, DateTimeKind.Utc).AddTicks(5464), "$2a$11$V0mQI38z89WuSprBmucXveQMLrHfl3sOSkC/BXITpvhWlLtc0pDau" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Sprints");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "SprintItems");

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
        }
    }
}
