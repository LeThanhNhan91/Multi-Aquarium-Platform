using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductImageUrlToOrderItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProductImageUrl",
                table: "OrderItems",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductImageUrl",
                table: "OrderItems");
        }
    }
}
