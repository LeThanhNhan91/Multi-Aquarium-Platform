#nullable disable
using System;
using System.Collections.Generic;
using Aquarium.Application.Interfaces.Store;
using Aquarium.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Persistence;

public partial class MultiStoreAquariumDBContext : DbContext
{
    private readonly IStoreContext _storeContext;
    public MultiStoreAquariumDBContext(
        DbContextOptions<MultiStoreAquariumDBContext> options,
        IStoreContext storeContext) : base(options)
    {
        _storeContext = storeContext;
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Conversation> Conversations { get; set; }

    public virtual DbSet<Inventory> Inventories { get; set; }

    public virtual DbSet<InventoryHistory> InventoryHistories { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<PostMedia> PostMedias { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductMedia> ProductMedias { get; set; }

    public virtual DbSet<Store> Stores { get; set; }

    public virtual DbSet<StorePost> StorePosts { get; set; }

    public virtual DbSet<StoreUser> StoreUsers { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // 1. Filter for Product: only get products of current Store
        modelBuilder.Entity<Product>().HasQueryFilter(p =>
            !_storeContext.StoreId.HasValue || 
            p.StoreId == _storeContext.StoreId);

        // 2. Filter for Order: only get order of current Store
        modelBuilder.Entity<Order>().HasQueryFilter(o =>
            !_storeContext.StoreId.HasValue ||
            o.StoreId == _storeContext.StoreId);

        // 3. Filter for StorePost
        modelBuilder.Entity<StorePost>().HasQueryFilter(p =>
            !_storeContext.StoreId.HasValue ||
            p.StoreId == _storeContext.StoreId);

        // 4. Filter for Conversation (Chat)
        modelBuilder.Entity<Conversation>().HasQueryFilter(c =>
            !_storeContext.StoreId.HasValue ||
            c.StoreId == _storeContext.StoreId);

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Categori__3214EC077BE9A047");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(255);

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK_Categories_Self");

            entity.HasOne(d => d.Store).WithMany(p => p.Categories)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK_Categories_Stores");
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Conversa__3214EC0794A1D9F0");

            entity.HasIndex(e => new { e.StoreId, e.CustomerId }, "IX_Conversations_StoreId_CustomerId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.LastMessageAt).HasDefaultValueSql("(getdate())");

            entity.HasIndex(c => new { c.StoreId, c.CustomerId }).IsUnique();

            entity.HasOne(d => d.Customer).WithMany(p => p.Conversations)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Conversations_Users");

            entity.HasOne(d => d.Store).WithMany(p => p.Conversations)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Conversations_Stores");
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Inventor__3214EC07CB3A2561");

            entity.HasIndex(e => e.ProductId, "UQ__Inventor__B40CC6CC0D6FBCF5").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.LastUpdated).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.RowVersion)
                .IsRowVersion();

            entity.HasOne(d => d.Product).WithOne(p => p.Inventory)
                .HasForeignKey<Inventory>(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Inventories_Products");
        });

        modelBuilder.Entity<InventoryHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.HasOne(d => d.Inventory).WithMany(p => p.Histories)
                .HasForeignKey(d => d.InventoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Messages__3214EC07BF6CCD15");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsRead).HasDefaultValue(false);

            entity.HasOne(d => d.Conversation).WithMany(p => p.Messages)
                .HasForeignKey(d => d.ConversationId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Messages_Conversations");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Orders__3214EC07D12AE0D7");

            entity.HasIndex(e => e.StoreId, "IX_Orders_StoreId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ShippingAddress)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Pending");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Orders_Users");

            entity.HasOne(d => d.Store).WithMany(p => p.Orders)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Orders_Stores");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__OrderIte__3214EC07295B1A28");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.PriceAtPurchase).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderItems_Orders");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderItems_Products");
        });

        modelBuilder.Entity<PostMedia>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PostMedi__3214EC07DA57A6F7");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.MediaType)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.MediaUrl).IsRequired();

            entity.HasOne(d => d.Post).WithMany(p => p.PostMedia)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PostMedias_StorePosts");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Products__3214EC07F5285BBB");

            entity.HasIndex(e => e.StoreId, "IX_Products_StoreId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(255);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Active");
            entity.Property(e => e.Type)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Products_Categories");

            entity.HasOne(d => d.Store).WithMany(p => p.Products)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Products_Stores");
        });

        modelBuilder.Entity<ProductMedia>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ProductM__3214EC07DFEEBD66");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.IsPrimary).HasDefaultValue(false);
            entity.Property(e => e.MediaType)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.MediaUrl).IsRequired();

            entity.HasOne(d => d.Product).WithMany(p => p.ProductMedia)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ProductMedias_Products");
        });

        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Stores__3214EC075B32211C");

            entity.HasIndex(e => e.Slug, "UQ__Stores__BC7B5FB647EF07E1").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(255);
            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(255);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Pending");
        });

        modelBuilder.Entity<StorePost>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__StorePos__3214EC078CAD1FB4");

            entity.HasIndex(e => e.StoreId, "IX_StorePosts_StoreId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Store).WithMany(p => p.StorePosts)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_StorePosts_Stores");
        });

        modelBuilder.Entity<StoreUser>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__StoreUse__3214EC0791FFC4A4");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Role)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasOne(d => d.Store).WithMany(p => p.StoreUsers)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_StoreUsers_Stores");

            entity.HasOne(d => d.User).WithMany(p => p.StoreUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_StoreUsers_Users");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC0715B380F7");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D105343AF58608").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Active");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}