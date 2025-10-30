using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Priority",
                table: "Demands",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111115"),
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "EditarDemanda", "Editar informações das demandas", "Editar Demanda" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111116"),
                columns: new[] { "Category", "Code", "Description", "Name" },
                values: new object[] { "Notificações", "NotificarEmail", "Enviar notificações por email", "Notificar Email" });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Active", "Category", "Code", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111117"), true, "Sistema", "GerenciarUsuarios", "Criar/editar usuários", "Gerenciar Usuários" },
                    { new Guid("11111111-1111-1111-1111-111111111118"), true, "Sistema", "GerenciarPerfis", "Criar/editar perfis", "Gerenciar Perfis" },
                    { new Guid("11111111-1111-1111-1111-111111111119"), true, "Sistema", "Configuracoes", "Acessar configurações", "Configurações" }
                });

            migrationBuilder.InsertData(
                table: "UserPermissions",
                columns: new[] { "PermissionId", "UserId", "Granted" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111116"), new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), true });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 30, 0, 55, 19, 464, DateTimeKind.Utc).AddTicks(481), "$2a$11$deA5o5JTDYTyEHqSsYdFDO4UsphNyJpQcBc3HeZfxKdnfc3FMyc7a" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 30, 0, 55, 19, 880, DateTimeKind.Utc).AddTicks(8232), "$2a$11$FgEDoydnz2GClMRtbGmWr.iZ62rElMbyb0M2udIbaFiJtowTJbdya" });

            migrationBuilder.InsertData(
                table: "UserPermissions",
                columns: new[] { "PermissionId", "UserId", "Granted" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111117"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111118"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111119"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserPermissions",
                keyColumns: new[] { "PermissionId", "UserId" },
                keyValues: new object[] { new Guid("11111111-1111-1111-1111-111111111117"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa") });

            migrationBuilder.DeleteData(
                table: "UserPermissions",
                keyColumns: new[] { "PermissionId", "UserId" },
                keyValues: new object[] { new Guid("11111111-1111-1111-1111-111111111118"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa") });

            migrationBuilder.DeleteData(
                table: "UserPermissions",
                keyColumns: new[] { "PermissionId", "UserId" },
                keyValues: new object[] { new Guid("11111111-1111-1111-1111-111111111119"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa") });

            migrationBuilder.DeleteData(
                table: "UserPermissions",
                keyColumns: new[] { "PermissionId", "UserId" },
                keyValues: new object[] { new Guid("11111111-1111-1111-1111-111111111116"), new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb") });

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111117"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111118"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111119"));

            migrationBuilder.AlterColumn<int>(
                name: "Priority",
                table: "Demands",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111115"),
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "Aprovar", "Aprovar para execução", "Aprovar Demandas" });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111116"),
                columns: new[] { "Category", "Code", "Description", "Name" },
                values: new object[] { "Sistema", "GerenciarUsuarios", "Criar/editar usuários", "Gerenciar Usuários" });

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
    }
}
