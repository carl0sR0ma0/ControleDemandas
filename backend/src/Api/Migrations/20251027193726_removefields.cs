using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class removefields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "Reporter",
                table: "Demands");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Demands",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "Demands",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reporter",
                table: "Demands",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 27, 17, 51, 41, 555, DateTimeKind.Utc).AddTicks(2275), "$2a$11$G7m916CT7hqrYNliCfEGvuNS37q/DCgFu8Rml5BOcXT3.VrTqsHfO" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 27, 17, 51, 41, 685, DateTimeKind.Utc).AddTicks(3354), "$2a$11$Km6tYFEGm.e6/CVmLngg1uyLustxA33OmRQ25/ARPQ4UtK7dEz3cS" });
        }
    }
}
