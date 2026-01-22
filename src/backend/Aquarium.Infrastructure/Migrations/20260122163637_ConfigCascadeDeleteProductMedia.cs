using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigCascadeDeleteProductMedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductMedias_Products",
                table: "ProductMedias");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductMedias_Products",
                table: "ProductMedias",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductMedias_Products",
                table: "ProductMedias");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductMedias_Products",
                table: "ProductMedias",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id");
        }
    }
}
