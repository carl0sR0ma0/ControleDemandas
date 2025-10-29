using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ResponsibleInHistoryDemand : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResponsibleUser",
                table: "StatusHistory",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 18, 5, 33, 463, DateTimeKind.Utc).AddTicks(3635), "$2a$11$klqeULIw44xdGtYjFHmzWOaiiSGt3B0P1kSLP0Mue1CRBzgV39NWe" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 18, 5, 33, 646, DateTimeKind.Utc).AddTicks(1124), "$2a$11$7E2RSqlRdR988P.zcCewGeJXNmmHBNEkw7OFzSMPyc5UqHvXC9pk." });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResponsibleUser",
                table: "StatusHistory");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 17, 57, 41, 805, DateTimeKind.Utc).AddTicks(4862), "$2a$11$3TXH3SZt0WmM.dzpM/A7VOO/1xSIDLDqGHV7T1NtV8JjVUdKem8/C" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 17, 57, 41, 984, DateTimeKind.Utc).AddTicks(9376), "$2a$11$OoM2RUyq8xRwNkEFhue0j.Q.hca9yK/M/qMOedOd/wFRfnyU/AcPy" });
        }
    }
}
