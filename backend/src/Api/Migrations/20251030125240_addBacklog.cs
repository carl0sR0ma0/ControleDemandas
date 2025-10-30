using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class addBacklog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BacklogId",
                table: "Demands",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Backlogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Backlogs", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Active", "Category", "Code", "Description", "Name" },
                values: new object[] { new Guid("11111111-1111-1111-1111-11111111111a"), true, "Demandas", "GerenciarBacklogs", "Criar e gerenciar backlogs, editar prioridades", "Gerenciar Backlogs" });

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

            migrationBuilder.InsertData(
                table: "UserPermissions",
                columns: new[] { "PermissionId", "UserId", "Granted" },
                values: new object[] { new Guid("11111111-1111-1111-1111-11111111111a"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true });

            migrationBuilder.CreateIndex(
                name: "IX_Demands_BacklogId",
                table: "Demands",
                column: "BacklogId");

            migrationBuilder.CreateIndex(
                name: "IX_Backlogs_Name",
                table: "Backlogs",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_Demands_Backlogs_BacklogId",
                table: "Demands",
                column: "BacklogId",
                principalTable: "Backlogs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Demands_Backlogs_BacklogId",
                table: "Demands");

            migrationBuilder.DropTable(
                name: "Backlogs");

            migrationBuilder.DropIndex(
                name: "IX_Demands_BacklogId",
                table: "Demands");

            migrationBuilder.DeleteData(
                table: "UserPermissions",
                keyColumns: new[] { "PermissionId", "UserId" },
                keyValues: new object[] { new Guid("11111111-1111-1111-1111-11111111111a"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa") });

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-11111111111a"));

            migrationBuilder.DropColumn(
                name: "BacklogId",
                table: "Demands");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 30, 11, 9, 6, 740, DateTimeKind.Utc).AddTicks(3197), "$2a$11$H1poKqpbtEKuXkcb/oNlXO7IlXDbrSvGhZrg/u8AI6HHNv.5HJx8a" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 30, 11, 9, 6, 981, DateTimeKind.Utc).AddTicks(652), "$2a$11$u4/tUTd6dB1TQtVRiYhqkePz0soeA2h2JhCtp/AIzUO4e25jrijVq" });
        }
    }
}
