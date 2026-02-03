using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicIdAndCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostMedias_StorePosts",
                table: "PostMedias");

            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                table: "PostMedias",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PostMedias_StorePosts",
                table: "PostMedias",
                column: "PostId",
                principalTable: "StorePosts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostMedias_StorePosts",
                table: "PostMedias");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "PostMedias");

            migrationBuilder.AddForeignKey(
                name: "FK_PostMedias_StorePosts",
                table: "PostMedias",
                column: "PostId",
                principalTable: "StorePosts",
                principalColumn: "Id");
        }
    }
}
