using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IdempotencyKeyOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "IX_Conversations_StoreId_CustomerId",
                table: "Conversations",
                newName: "IX_Conversations_StoreId_CustomerId1");

            migrationBuilder.AddColumn<Guid>(
                name: "IdempotencyKey",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_StoreId_CustomerId",
                table: "Conversations",
                columns: new[] { "StoreId", "CustomerId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Conversations_StoreId_CustomerId",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "Orders");

            migrationBuilder.RenameIndex(
                name: "IX_Conversations_StoreId_CustomerId1",
                table: "Conversations",
                newName: "IX_Conversations_StoreId_CustomerId");
        }
    }
}
