using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDepartmentField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 16, 51, 14, 486, DateTimeKind.Utc).AddTicks(2076), "$2a$11$3MLqlV3dC/li5.FAAXQcT.pHlig1XynrC2ziHkZnqXBQ1xbV/PBqW" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 16, 51, 14, 669, DateTimeKind.Utc).AddTicks(2318), "$2a$11$QiODz1ce/iyx3kRVvcAfWON.x6caZPpL9oAgxzVGBZx3LXuVYw2hO" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 16, 33, 0, 997, DateTimeKind.Utc).AddTicks(8168), "$2a$11$3P9zs4Y55YbpuQXvnR93huanqEY4USaRkvxE5iDjP8YJY4Nndj4dO" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 16, 33, 1, 192, DateTimeKind.Utc).AddTicks(8995), "$2a$11$mHO2l0QGA1rGkkOuoL1IKeDMhAVPNYUbR20SMpwzKDInOMsKmwIG." });
        }
    }
}
