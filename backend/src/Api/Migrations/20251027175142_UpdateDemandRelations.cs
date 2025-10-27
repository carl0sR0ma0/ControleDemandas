using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDemandRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ModuleId",
                table: "Demands",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ReporterAreaId",
                table: "Demands",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RequesterUserId",
                table: "Demands",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SystemVersionId",
                table: "Demands",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UnitId",
                table: "Demands",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""ModuleId"" = m.""Id"" FROM ""Modules"" m WHERE LOWER(m.""Name"") = LOWER(d.""Module"");");
            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""ReporterAreaId"" = a.""Id"" FROM ""Areas"" a WHERE LOWER(a.""Name"") = LOWER(d.""ReporterArea"");");
            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""UnitId"" = u.""Id"" FROM ""Units"" u WHERE LOWER(u.""Name"") = LOWER(d.""Unit"");");
            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""SystemVersionId"" = sv.""Id"" FROM ""SystemVersions"" sv WHERE LOWER(sv.""Version"") = LOWER(d.""SystemVersion"");");
            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""RequesterUserId"" = usr.""Id"" FROM ""Users"" usr WHERE LOWER(usr.""Name"") = LOWER(d.""RequesterResponsible"");");

            migrationBuilder.Sql(@"UPDATE ""Demands"" SET ""ModuleId"" = (SELECT ""Id"" FROM ""Modules"" LIMIT 1) WHERE ""ModuleId"" IS NULL;");
            migrationBuilder.Sql(@"UPDATE ""Demands"" SET ""ReporterAreaId"" = (SELECT ""Id"" FROM ""Areas"" LIMIT 1) WHERE ""ReporterAreaId"" IS NULL;");
            migrationBuilder.Sql(@"UPDATE ""Demands"" SET ""UnitId"" = (SELECT ""Id"" FROM ""Units"" LIMIT 1) WHERE ""UnitId"" IS NULL;");
            migrationBuilder.Sql(@"UPDATE ""Demands"" SET ""RequesterUserId"" = (SELECT ""Id"" FROM ""Users"" ORDER BY ""CreatedAt"" LIMIT 1) WHERE ""RequesterUserId"" IS NULL;");

            migrationBuilder.AlterColumn<Guid>(
                name: "ModuleId",
                table: "Demands",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ReporterAreaId",
                table: "Demands",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "RequesterUserId",
                table: "Demands",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "UnitId",
                table: "Demands",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_Demands_ModuleId",
                table: "Demands",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_ReporterAreaId",
                table: "Demands",
                column: "ReporterAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_RequesterUserId",
                table: "Demands",
                column: "RequesterUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_SystemVersionId",
                table: "Demands",
                column: "SystemVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_UnitId",
                table: "Demands",
                column: "UnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_Demands_Areas_ReporterAreaId",
                table: "Demands",
                column: "ReporterAreaId",
                principalTable: "Areas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Demands_Modules_ModuleId",
                table: "Demands",
                column: "ModuleId",
                principalTable: "Modules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Demands_SystemVersions_SystemVersionId",
                table: "Demands",
                column: "SystemVersionId",
                principalTable: "SystemVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Demands_Units_UnitId",
                table: "Demands",
                column: "UnitId",
                principalTable: "Units",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Demands_Users_RequesterUserId",
                table: "Demands",
                column: "RequesterUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.DropColumn(
                name: "Module",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "ProductModule",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "ReporterArea",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "RequesterResponsible",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "SystemVersion",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "Demands");
        }        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Demands_Areas_ReporterAreaId",
                table: "Demands");

            migrationBuilder.DropForeignKey(
                name: "FK_Demands_Modules_ModuleId",
                table: "Demands");

            migrationBuilder.DropForeignKey(
                name: "FK_Demands_SystemVersions_SystemVersionId",
                table: "Demands");

            migrationBuilder.DropForeignKey(
                name: "FK_Demands_Units_UnitId",
                table: "Demands");

            migrationBuilder.DropForeignKey(
                name: "FK_Demands_Users_RequesterUserId",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_ModuleId",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_ReporterAreaId",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_RequesterUserId",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_SystemVersionId",
                table: "Demands");

            migrationBuilder.DropIndex(
                name: "IX_Demands_UnitId",
                table: "Demands");

            migrationBuilder.AddColumn<string>(
                name: "Module",
                table: "Demands",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductModule",
                table: "Demands",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReporterArea",
                table: "Demands",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequesterResponsible",
                table: "Demands",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SystemVersion",
                table: "Demands",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "Demands",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""Module"" = m.""Name"" FROM ""Modules"" m WHERE m.""Id"" = d.""ModuleId"";");
            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""ReporterArea"" = a.""Name"" FROM ""Areas"" a WHERE a.""Id"" = d.""ReporterAreaId"";");
            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""Unit"" = u.""Name"" FROM ""Units"" u WHERE u.""Id"" = d.""UnitId"";");
            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""SystemVersion"" = sv.""Version"" FROM ""SystemVersions"" sv WHERE sv.""Id"" = d.""SystemVersionId"";");
            migrationBuilder.Sql(@"UPDATE ""Demands"" d SET ""RequesterResponsible"" = usr.""Name"" FROM ""Users"" usr WHERE usr.""Id"" = d.""RequesterUserId"";");

            migrationBuilder.Sql(@"UPDATE ""Demands"" SET ""Module"" = '' WHERE ""Module"" IS NULL;");
            migrationBuilder.Sql(@"UPDATE ""Demands"" SET ""ReporterArea"" = '' WHERE ""ReporterArea"" IS NULL;");
            migrationBuilder.Sql(@"UPDATE ""Demands"" SET ""RequesterResponsible"" = '' WHERE ""RequesterResponsible"" IS NULL;");
            migrationBuilder.Sql(@"UPDATE ""Demands"" SET ""Unit"" = '' WHERE ""Unit"" IS NULL;");

            migrationBuilder.DropColumn(
                name: "ModuleId",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "ReporterAreaId",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "RequesterUserId",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "SystemVersionId",
                table: "Demands");

            migrationBuilder.DropColumn(
                name: "UnitId",
                table: "Demands");

            migrationBuilder.AlterColumn<string>(
                name: "Module",
                table: "Demands",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(120)",
                oldMaxLength: 120,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReporterArea",
                table: "Demands",
                type: "character varying(60)",
                maxLength: 60,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(60)",
                oldMaxLength: 60,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RequesterResponsible",
                table: "Demands",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(120)",
                oldMaxLength: 120,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                table: "Demands",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(120)",
                oldMaxLength: 120,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 27, 14, 57, 56, 28, DateTimeKind.Utc).AddTicks(179), "$2a$11$1liel38STfM9vA2cYJN8D.0Q691818DVF51pO7vpXMdXDgSArc3Iq" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 27, 14, 57, 56, 146, DateTimeKind.Utc).AddTicks(2886), "$2a$11$aoZ/Yp04YRBbRY0lZcwcGepohAwBeb.nRLCc31HnhiV/RskTNQ0c2" });
        }    }
}




