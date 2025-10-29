using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddResponsibleUserToStatusHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 17, 57, 41, 805, DateTimeKind.Utc).AddTicks(4862), "$2a$11$3TXH3SZt0WmM.dzpM/A7VOO/1xSIDLDqGHV7T1NtV8JjVUdKem8/C" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 29, 17, 57, 41, 984, DateTimeKind.Utc).AddTicks(9376), "$2a$11$OoM2RUyq8xRwNkEFhue0j.Q.hca9yK/M/qMOedOd/wFRfnyU/AcPy" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                columns: new[] { "CreatedAt", "PasswordHash", "ProfilePictureUrl" },
                values: new object[] { new DateTime(2025, 10, 29, 17, 17, 4, 441, DateTimeKind.Utc).AddTicks(6084), "$2a$11$fFqiOT7eKbhez49tiYkDBuuUJ3W7uwMnx3mT1tBEyt4PTyCx11LyS", null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "CreatedAt", "PasswordHash", "ProfilePictureUrl" },
                values: new object[] { new DateTime(2025, 10, 29, 17, 17, 4, 655, DateTimeKind.Utc).AddTicks(4866), "$2a$11$99p3xu7qtfAr1pBwAWjYO.uW5pVTGYHdJSc.gOER6kupnQyzUKbSq", null });
        }
    }
}
