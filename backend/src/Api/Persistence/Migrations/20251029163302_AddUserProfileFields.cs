using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "Users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureUrl",
                table: "Users",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "Department", "PasswordHash", "Phone", "ProfilePictureUrl" },
                values: new object[] { new DateTime(2025, 10, 29, 16, 33, 0, 997, DateTimeKind.Utc).AddTicks(8168), null, "$2a$11$3P9zs4Y55YbpuQXvnR93huanqEY4USaRkvxE5iDjP8YJY4Nndj4dO", null, null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "Department", "PasswordHash", "Phone", "ProfilePictureUrl" },
                values: new object[] { new DateTime(2025, 10, 29, 16, 33, 1, 192, DateTimeKind.Utc).AddTicks(8995), null, "$2a$11$mHO2l0QGA1rGkkOuoL1IKeDMhAVPNYUbR20SMpwzKDInOMsKmwIG.", null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Department",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 27, 19, 37, 25, 612, DateTimeKind.Utc).AddTicks(4682), "$2a$11$5HYvi8YdzgAGGEE6spaUKOVQBtN7YsQCmv5rmNYNReexh2eKDZBUS" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 27, 19, 37, 25, 721, DateTimeKind.Utc).AddTicks(7538), "$2a$11$SkQHAtSRAx/XyHSGtzKEeep8IFTdAqNvj3NvMdzoBQ3xY9IodPO/S" });
        }
    }
}
