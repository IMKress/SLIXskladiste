using Microsoft.EntityFrameworkCore.Migrations;

namespace SKLADISTE.DAL.Migrations
{
    public partial class UpdateArtiklLabels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"UPDATE a
SET a.ArtiklOznaka = UPPER(LEFT(k.KategorijaNaziv, 1)) + CAST(ABS(CHECKSUM(NEWID())) % 9000 + 1000 AS varchar(4))
FROM Artikli a
JOIN Kategorije k ON a.KategorijaId = k.KategorijaId
WHERE a.ArtiklOznaka IS NULL;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
