using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveProfilePictureUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Department",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 17, 17, 4, 441, DateTimeKind.Utc).AddTicks(6084), "$2a$11$fFqiOT7eKbhez49tiYkDBuuUJ3W7uwMnx3mT1tBEyt4PTyCx11LyS" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 17, 17, 4, 655, DateTimeKind.Utc).AddTicks(4866), "$2a$11$99p3xu7qtfAr1pBwAWjYO.uW5pVTGYHdJSc.gOER6kupnQyzUKbSq" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "Users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "Department", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 16, 51, 14, 486, DateTimeKind.Utc).AddTicks(2076), null, "$2a$11$3MLqlV3dC/li5.FAAXQcT.pHlig1XynrC2ziHkZnqXBQ1xbV/PBqW" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "Department", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 16, 51, 14, 669, DateTimeKind.Utc).AddTicks(2318), null, "$2a$11$QiODz1ce/iyx3kRVvcAfWON.x6caZPpL9oAgxzVGBZx3LXuVYw2hO" });
        }
    }
}
