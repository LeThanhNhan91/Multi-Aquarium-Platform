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
            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'OrderItems' AND COLUMN_NAME = 'ProductImageUrl'
                )
                BEGIN
                    ALTER TABLE [OrderItems] ADD [ProductImageUrl] nvarchar(max) NULL;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'OrderItems' AND COLUMN_NAME = 'ProductImageUrl'
                )
                BEGIN
                    ALTER TABLE [OrderItems] DROP COLUMN [ProductImageUrl];
                END
            ");
        }
    }
}
