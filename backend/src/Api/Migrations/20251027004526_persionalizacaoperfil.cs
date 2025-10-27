using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class persionalizacaoperfil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BadgeClass",
                table: "Profiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 27, 0, 45, 22, 20, DateTimeKind.Utc).AddTicks(5901), "$2a$11$l2j6z3JpIFZU2AHlp.NDs.TbDoLrM32sR/KF4seeUW9S7p5eopXV." });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 27, 0, 45, 22, 225, DateTimeKind.Utc).AddTicks(7644), "$2a$11$rYtvWhSBDEKUBQdy/PKSXe3aYfixnhoYlD73Zqa1pr7cPQS1SKbiq" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BadgeClass",
                table: "Profiles");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 26, 23, 51, 31, 857, DateTimeKind.Utc).AddTicks(5405), "$2a$11$fUPDW0/jSE.bntmhD4n0euihXbXSTvyZ./4KdF2RO3tVAwE2pBrUC" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 26, 23, 51, 32, 71, DateTimeKind.Utc).AddTicks(4559), "$2a$11$PR2txM7kNpsQaj7Rk04Iz.1bRevsv9JGLHCuT/JylcOOtsHPWWfAa" });
        }
    }
}
