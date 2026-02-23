using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncOrderItemFishInstance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Note: FishInstanceMedia table already exists with correct name
            // Skip table rename and constraint operations

            // Only add FishInstanceId column if not exists (handled by SQL script)
            // This migration just syncs EF Core model with database
            
            // The actual column, constraint, and index were created via SQL script
            // So we comment out the migration operations to avoid conflicts
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Note: We don't revert changes made by SQL script
            // This is a sync-only migration
        }
    }
}
