using Microsoft.EntityFrameworkCore.Migrations;

namespace SKLADISTE.DAL.Migrations
{
    public partial class DobavljacIdNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dokumenti_Dobavljaci_DobavljacId",
                table: "Dokumenti");

            migrationBuilder.AlterColumn<int>(
                name: "DobavljacId",
                table: "Dokumenti",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Dokumenti_Dobavljaci_DobavljacId",
                table: "Dokumenti",
                column: "DobavljacId",
                principalTable: "Dobavljaci",
                principalColumn: "DobavljacId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dokumenti_Dobavljaci_DobavljacId",
                table: "Dokumenti");

            migrationBuilder.AlterColumn<int>(
                name: "DobavljacId",
                table: "Dokumenti",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Dokumenti_Dobavljaci_DobavljacId",
                table: "Dokumenti",
                column: "DobavljacId",
                principalTable: "Dobavljaci",
                principalColumn: "DobavljacId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
