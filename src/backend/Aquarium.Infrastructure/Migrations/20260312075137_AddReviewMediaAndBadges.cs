using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewMediaAndBadges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductReviewMedias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ProductReviewId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MediaUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PublicId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getutcdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductReviewMedias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductReviewMedias_ProductReviews",
                        column: x => x.ProductReviewId,
                        principalTable: "ProductReviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StoreBadges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BadgeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AwardedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getutcdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreBadges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StoreBadges_Stores",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StoreReviewMedias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    StoreReviewId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MediaUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PublicId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getutcdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreReviewMedias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StoreReviewMedias_StoreReviews",
                        column: x => x.StoreReviewId,
                        principalTable: "StoreReviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductReviewMedias_ProductReviewId",
                table: "ProductReviewMedias",
                column: "ProductReviewId");

            migrationBuilder.CreateIndex(
                name: "IX_StoreBadges_StoreId_BadgeType",
                table: "StoreBadges",
                columns: new[] { "StoreId", "BadgeType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StoreReviewMedias_StoreReviewId",
                table: "StoreReviewMedias",
                column: "StoreReviewId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductReviewMedias");

            migrationBuilder.DropTable(
                name: "StoreBadges");

            migrationBuilder.DropTable(
                name: "StoreReviewMedias");
        }
    }
}
