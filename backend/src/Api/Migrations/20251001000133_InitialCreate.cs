using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

            migrationBuilder.CreateTable(
                name: "Demands",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Protocol = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    OpenedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Observation = table.Column<string>(type: "text", nullable: true),
                    Module = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    RequesterResponsible = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    ReporterArea = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    OccurrenceType = table.Column<int>(type: "integer", nullable: false),
                    Unit = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Classification = table.Column<int>(type: "integer", nullable: false),
                    Client = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Priority = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    SystemVersion = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Reporter = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    ProductModule = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    NextActionResponsible = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    EstimatedDelivery = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DocumentUrl = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Demands", x => x.Id);
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
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    Permissions = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
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
                    Note = table.Column<string>(type: "text", nullable: true)
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
                table: "Users",
                columns: new[] { "Id", "Active", "CreatedAt", "Email", "Name", "PasswordHash", "Permissions", "Role" },
                values: new object[] { new Guid("f59e21ca-cfcf-4b56-b221-17525b419a6e"), true, new DateTime(2025, 10, 1, 0, 1, 29, 913, DateTimeKind.Utc).AddTicks(8691), "admin@empresa.com", "Administrador", "$2a$11$pVezYjWEgtNJD0ekEqkXQemZXFfKdq.Ajw1NaCIaVqmT8i0oLd3u.", 63L, "Admin" });

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_DemandId",
                table: "Attachments",
                column: "DemandId");

            migrationBuilder.CreateIndex(
                name: "IX_Demands_Protocol",
                table: "Demands",
                column: "Protocol",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StatusHistory_DemandId",
                table: "StatusHistory",
                column: "DemandId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "ProtocolCounters");

            migrationBuilder.DropTable(
                name: "StatusHistory");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Demands");
        }
    }
}
