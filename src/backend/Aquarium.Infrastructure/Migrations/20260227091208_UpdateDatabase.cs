using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Stores' AND COLUMN_NAME = 'AverageRating')
                BEGIN ALTER TABLE [Stores] ADD [AverageRating] float NOT NULL DEFAULT 0.0; END
            ");
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Stores' AND COLUMN_NAME = 'PhoneNumber')
                BEGIN ALTER TABLE [Stores] ADD [PhoneNumber] nvarchar(max) NULL; END
            ");
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Stores' AND COLUMN_NAME = 'TotalReviews')
                BEGIN ALTER TABLE [Stores] ADD [TotalReviews] int NOT NULL DEFAULT 0; END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Stores' AND COLUMN_NAME = 'AverageRating')
                BEGIN ALTER TABLE [Stores] DROP COLUMN [AverageRating]; END
            ");
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Stores' AND COLUMN_NAME = 'PhoneNumber')
                BEGIN ALTER TABLE [Stores] DROP COLUMN [PhoneNumber]; END
            ");
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Stores' AND COLUMN_NAME = 'TotalReviews')
                BEGIN ALTER TABLE [Stores] DROP COLUMN [TotalReviews]; END
            ");
        }
    }
}
