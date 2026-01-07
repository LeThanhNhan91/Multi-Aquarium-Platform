using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aquarium.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.CreateTable(
            //    name: "Stores",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
            //        Slug = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
            //        Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
            //        DeliveryArea = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
            //        LogoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        CoverImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        VideoIntroUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__Stores__3214EC075B32211C", x => x.Id);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Users",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
            //        PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //        FullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
            //        PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
            //        Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Active"),
            //        CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__Users__3214EC0715B380F7", x => x.Id);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Categories",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
            //        StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
            //        ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__Categori__3214EC077BE9A047", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_Categories_Self",
            //            column: x => x.ParentId,
            //            principalTable: "Categories",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_Categories_Stores",
            //            column: x => x.StoreId,
            //            principalTable: "Stores",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "StorePosts",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__StorePos__3214EC078CAD1FB4", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_StorePosts_Stores",
            //            column: x => x.StoreId,
            //            principalTable: "Stores",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Conversations",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        LastMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        LastMessageAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__Conversa__3214EC0794A1D9F0", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_Conversations_Stores",
            //            column: x => x.StoreId,
            //            principalTable: "Stores",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_Conversations_Users",
            //            column: x => x.CustomerId,
            //            principalTable: "Users",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Orders",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
            //        TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
            //        ShippingAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
            //        CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__Orders__3214EC07D12AE0D7", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_Orders_Stores",
            //            column: x => x.StoreId,
            //            principalTable: "Stores",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_Orders_Users",
            //            column: x => x.CustomerId,
            //            principalTable: "Users",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "StoreUsers",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
            //        CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__StoreUse__3214EC0791FFC4A4", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_StoreUsers_Stores",
            //            column: x => x.StoreId,
            //            principalTable: "Stores",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_StoreUsers_Users",
            //            column: x => x.UserId,
            //            principalTable: "Users",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Products",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
            //        Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
            //        BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
            //        Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Active"),
            //        Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //        CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__Products__3214EC07F5285BBB", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_Products_Categories",
            //            column: x => x.CategoryId,
            //            principalTable: "Categories",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_Products_Stores",
            //            column: x => x.StoreId,
            //            principalTable: "Stores",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "PostMedias",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        PostId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        MediaUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //        MediaType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__PostMedi__3214EC07DA57A6F7", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_PostMedias_StorePosts",
            //            column: x => x.PostId,
            //            principalTable: "StorePosts",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Messages",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //        IsRead = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
            //        CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__Messages__3214EC07BF6CCD15", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_Messages_Conversations",
            //            column: x => x.ConversationId,
            //            principalTable: "Conversations",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Inventories",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        QuantityAvailable = table.Column<int>(type: "int", nullable: false),
            //        QuantityReserved = table.Column<int>(type: "int", nullable: false),
            //        LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__Inventor__3214EC07CB3A2561", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_Inventories_Products",
            //            column: x => x.ProductId,
            //            principalTable: "Products",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "OrderItems",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Quantity = table.Column<int>(type: "int", nullable: false),
            //        PriceAtPurchase = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__OrderIte__3214EC07295B1A28", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_OrderItems_Orders",
            //            column: x => x.OrderId,
            //            principalTable: "Orders",
            //            principalColumn: "Id");
            //        table.ForeignKey(
            //            name: "FK_OrderItems_Products",
            //            column: x => x.ProductId,
            //            principalTable: "Products",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "ProductMedias",
            //    columns: table => new
            //    {
            //        Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
            //        ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        MediaUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //        MediaType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
            //        IsPrimary = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK__ProductM__3214EC07DFEEBD66", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_ProductMedias_Products",
            //            column: x => x.ProductId,
            //            principalTable: "Products",
            //            principalColumn: "Id");
            //    });

            //migrationBuilder.CreateIndex(
            //    name: "IX_Categories_ParentId",
            //    table: "Categories",
            //    column: "ParentId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Categories_StoreId",
            //    table: "Categories",
            //    column: "StoreId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Conversations_CustomerId",
            //    table: "Conversations",
            //    column: "CustomerId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Conversations_StoreId_CustomerId",
            //    table: "Conversations",
            //    columns: new[] { "StoreId", "CustomerId" });

            //migrationBuilder.CreateIndex(
            //    name: "UQ__Inventor__B40CC6CC0D6FBCF5",
            //    table: "Inventories",
            //    column: "ProductId",
            //    unique: true);

            //migrationBuilder.CreateIndex(
            //    name: "IX_Messages_ConversationId",
            //    table: "Messages",
            //    column: "ConversationId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_OrderItems_OrderId",
            //    table: "OrderItems",
            //    column: "OrderId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_OrderItems_ProductId",
            //    table: "OrderItems",
            //    column: "ProductId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Orders_CustomerId",
            //    table: "Orders",
            //    column: "CustomerId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Orders_StoreId",
            //    table: "Orders",
            //    column: "StoreId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_PostMedias_PostId",
            //    table: "PostMedias",
            //    column: "PostId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_ProductMedias_ProductId",
            //    table: "ProductMedias",
            //    column: "ProductId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Products_CategoryId",
            //    table: "Products",
            //    column: "CategoryId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Products_StoreId",
            //    table: "Products",
            //    column: "StoreId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_StorePosts_StoreId",
            //    table: "StorePosts",
            //    column: "StoreId");

            //migrationBuilder.CreateIndex(
            //    name: "UQ__Stores__BC7B5FB647EF07E1",
            //    table: "Stores",
            //    column: "Slug",
            //    unique: true);

            //migrationBuilder.CreateIndex(
            //    name: "IX_StoreUsers_StoreId",
            //    table: "StoreUsers",
            //    column: "StoreId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_StoreUsers_UserId",
            //    table: "StoreUsers",
            //    column: "UserId");

            //migrationBuilder.CreateIndex(
            //    name: "UQ__Users__A9D105343AF58608",
            //    table: "Users",
            //    column: "Email",
            //    unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Inventories");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "PostMedias");

            migrationBuilder.DropTable(
                name: "ProductMedias");

            migrationBuilder.DropTable(
                name: "StoreUsers");

            migrationBuilder.DropTable(
                name: "Conversations");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "StorePosts");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Stores");
        }
    }
}
