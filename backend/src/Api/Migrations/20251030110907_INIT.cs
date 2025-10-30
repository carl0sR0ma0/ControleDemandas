using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class INIT : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

            migrationBuilder.CreateTable(
                name: "Areas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Areas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Category = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    BadgeClass = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProtocolCounters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    LastNumber = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProtocolCounters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Systems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Systems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Units",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Units", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProfilePermissions",
                columns: table => new
                {
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Granted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfilePermissions", x => new { x.ProfileId, x.PermissionId });
                    table.ForeignKey(
                        name: "FK_ProfilePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfilePermissions_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    AreaId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsSpecial = table.Column<bool>(type: "boolean", nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Areas_AreaId",
                        column: x => x.AreaId,
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Users_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Modules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    SystemEntityId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Modules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Modules_Systems_SystemEntityId",
                        column: x => x.SystemEntityId,
                        principalTable: "Systems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SystemVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    SystemEntityId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SystemVersions_Systems_SystemEntityId",
                        column: x => x.SystemEntityId,
                        principalTable: "Systems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPermissions",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Granted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissions", x => new { x.UserId, x.PermissionId });
                    table.ForeignKey(
                        name: "FK_UserPermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Demands",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Protocol = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    OpenedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Observation = table.Column<string>(type: "text", nullable: true),
                    ModuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequesterUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReporterAreaId = table.Column<Guid>(type: "uuid", nullable: false),
                    OccurrenceType = table.Column<int>(type: "integer", nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Classification = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: true),
                    Responsible = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    SystemVersionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    NextActionResponsible = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    EstimatedDelivery = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DocumentUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Demands", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Demands_Areas_ReporterAreaId",
                        column: x => x.ReporterAreaId,
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Demands_Modules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "Modules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Demands_SystemVersions_SystemVersionId",
                        column: x => x.SystemVersionId,
                        principalTable: "SystemVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Demands_Units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Demands_Users_RequesterUserId",
                        column: x => x.RequesterUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    StoragePath = table.Column<string>(type: "text", nullable: false),
                    DemandId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Attachments_Demands_DemandId",
                        column: x => x.DemandId,
                        principalTable: "Demands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StatusHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DemandId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Author = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Note = table.Column<string>(type: "text", nullable: true),
                    ResponsibleUser = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatusHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StatusHistory_Demands_DemandId",
                        column: x => x.DemandId,
                        principalTable: "Demands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Active", "Category", "Code", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), true, "Dashboard", "AcessarDashboard", "Acesso ao painel principal", "Acessar Dashboard" },
                    { new Guid("11111111-1111-1111-1111-111111111112"), true, "Demandas", "VisualizarDemandas", "Ver lista e detalhes das demandas", "Visualizar Demandas" },
                    { new Guid("11111111-1111-1111-1111-111111111113"), true, "Demandas", "RegistrarDemandas", "Criar novas demandas", "Registrar Demandas" },
                    { new Guid("11111111-1111-1111-1111-111111111114"), true, "Demandas", "EditarStatus", "Alterar status/histórico", "Editar Status" },
                    { new Guid("11111111-1111-1111-1111-111111111115"), true, "Demandas", "EditarDemanda", "Editar informações das demandas", "Editar Demanda" },
                    { new Guid("11111111-1111-1111-1111-111111111116"), true, "Notificações", "NotificarEmail", "Enviar notificações por email", "Notificar Email" },
                    { new Guid("11111111-1111-1111-1111-111111111117"), true, "Sistema", "GerenciarUsuarios", "Criar/editar usuários", "Gerenciar Usuários" },
                    { new Guid("11111111-1111-1111-1111-111111111118"), true, "Sistema", "GerenciarPerfis", "Criar/editar perfis", "Gerenciar Perfis" },
                    { new Guid("11111111-1111-1111-1111-111111111119"), true, "Sistema", "Configuracoes", "Acessar configurações", "Configurações" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Active", "AreaId", "CreatedAt", "Email", "IsSpecial", "Name", "PasswordHash", "Phone", "ProfileId", "Role" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true, null, new DateTime(2025, 10, 30, 11, 9, 6, 740, DateTimeKind.Utc).AddTicks(3197), "admin@empresa.com", false, "Administrador", "$2a$11$H1poKqpbtEKuXkcb/oNlXO7IlXDbrSvGhZrg/u8AI6HHNv.5HJx8a", null, null, "Admin" },
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), true, null, new DateTime(2025, 10, 30, 11, 9, 6, 981, DateTimeKind.Utc).AddTicks(652), "gestor@empresa.com", false, "Gestor", "$2a$11$u4/tUTd6dB1TQtVRiYhqkePz0soeA2h2JhCtp/AIzUO4e25jrijVq", null, null, "Gestor" }
                });

            migrationBuilder.InsertData(
                table: "UserPermissions",
                columns: new[] { "PermissionId", "UserId", "Granted" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111112"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111113"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111114"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111115"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111116"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111117"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111118"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111119"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true },
                    { new Guid("11111111-1111-1111-1111-111111111111"), new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), true },
                    { new Guid("11111111-1111-1111-1111-111111111112"), new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), true },
                    { new Guid("11111111-1111-1111-1111-111111111113"), new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), true },
                    { new Guid("11111111-1111-1111-1111-111111111114"), new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), true },
                    { new Guid("11111111-1111-1111-1111-111111111115"), new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), true },
                    { new Guid("11111111-1111-1111-1111-111111111116"), new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), true }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Areas_Name",
                table: "Areas",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_DemandId",
                table: "Attachments",
                column: "DemandId");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_ModuleId",
                table: "Demands",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_Protocol",
                table: "Demands",
                column: "Protocol",
                unique: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_Modules_SystemEntityId_Name",
                table: "Modules",
                columns: new[] { "SystemEntityId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Code",
                table: "Permissions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfilePermissions_PermissionId",
                table: "ProfilePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_Name",
                table: "Profiles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StatusHistory_DemandId",
                table: "StatusHistory",
                column: "DemandId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemVersions_SystemEntityId_Version",
                table: "SystemVersions",
                columns: new[] { "SystemEntityId", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Systems_Name",
                table: "Systems",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Units_Name",
                table: "Units",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_PermissionId",
                table: "UserPermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_AreaId",
                table: "Users",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ProfileId",
                table: "Users",
                column: "ProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "ProfilePermissions");

            migrationBuilder.DropTable(
                name: "ProtocolCounters");

            migrationBuilder.DropTable(
                name: "StatusHistory");

            migrationBuilder.DropTable(
                name: "UserPermissions");

            migrationBuilder.DropTable(
                name: "Demands");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Modules");

            migrationBuilder.DropTable(
                name: "SystemVersions");

            migrationBuilder.DropTable(
                name: "Units");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Systems");

            migrationBuilder.DropTable(
                name: "Areas");

            migrationBuilder.DropTable(
                name: "Profiles");
        }
    }
}
