using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMediaFieldsToStoreAndProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CoverImageUrl",
                table: "Stores",
                newName: "LogoPublicId");

            migrationBuilder.AddColumn<string>(
                name: "CoverPublicId",
                table: "Stores",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverUrl",
                table: "Stores",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                table: "ProductMedias",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverPublicId",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "CoverUrl",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "ProductMedias");

            migrationBuilder.RenameColumn(
                name: "LogoPublicId",
                table: "Stores",
                newName: "CoverImageUrl");
        }
    }
}
