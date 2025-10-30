using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class addPriority : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Demands",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 23, 55, 28, 398, DateTimeKind.Utc).AddTicks(8718), "$2a$11$YBOtyHzQgvlfuylRqGGip.RJ/W0ev7AeaQjqazynivXyR9FJky9VS" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 23, 55, 28, 690, DateTimeKind.Utc).AddTicks(2689), "$2a$11$OtBbowEFxGXrbo1py7LiVe8th7PZBzlqgWA1f3vUZvnE.G//zTUrC" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Demands");

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
    }
}
