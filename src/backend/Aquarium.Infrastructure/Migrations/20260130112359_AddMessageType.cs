using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Stores",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Users",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Conversations",
                table: "Messages");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Stores",
                table: "Conversations",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Users",
                table: "Conversations",
                column: "CustomerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Conversations",
                table: "Messages",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Stores",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Users",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Conversations",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Messages");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Stores",
                table: "Conversations",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Users",
                table: "Conversations",
                column: "CustomerId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Conversations",
                table: "Messages",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id");
        }
    }
}
