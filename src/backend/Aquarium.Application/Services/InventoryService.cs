using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Inventory;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Inventory;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IStoreRepository _storeRepository;
        private readonly IProductRepository _productRepository;

        public InventoryService(
            IInventoryRepository inventoryRepository,
            IStoreRepository storeRepository,
            IProductRepository productRepository)
        {
            _inventoryRepository = inventoryRepository;
            _storeRepository = storeRepository;
            _productRepository = productRepository;
        }

        public async Task<InventoryResponse> GetStockAsync(Guid productId)
        {
            var inventory = await _inventoryRepository.GetByProductIdAsync(productId);
            if (inventory == null)
            {
                // No Inventory => return 0 to all (fail-safe)
                return new InventoryResponse(productId, 0, 0, 0, DateTime.UtcNow);
            }
            return new InventoryResponse(productId, inventory.Quantity, inventory.QuantityReserved, inventory.AvailableStock, inventory.LastUpdated);
        }

        public async Task InitInventoryAsync(Guid productId)
        {
            var exists = await _inventoryRepository.GetByProductIdAsync(productId);
            if (exists != null) return;

            var inventory = new Inventory
            {
                Id = Guid.NewGuid(),
                ProductId = productId,
                Quantity = 0,
                QuantityReserved = 0,
                LastUpdated = DateTime.UtcNow
            };
            await _inventoryRepository.AddAsync(inventory);
            await _inventoryRepository.SaveChangesAsync();
        }

        public async Task UpdateStockAsync(Guid productId, UpdateStockRequest request, Guid userId)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null) throw new NotFoundException("Product", productId);

            // Check Owner 
            var member = await _storeRepository.GetStoreUserAsync(product.StoreId, userId);
            if (member == null || (member.Role != "Owner" && member.Role != "Manager"))
                throw new ForbiddenException("No permissions to edit the inventory.");

            var inventory = await _inventoryRepository.GetByProductIdAsync(productId);
            if (inventory == null)
            {
                inventory = new Inventory { Id = Guid.NewGuid(), ProductId = productId, Quantity = 0 };
                await _inventoryRepository.AddAsync(inventory);
            }

            int quantityChange = 0;

            switch (request.Type)
            {
                case "Import":
                    inventory.Quantity += request.Amount;
                    quantityChange = request.Amount;
                    break;

                case "Export":
                    if (inventory.Quantity < request.Amount)
                        throw new BadRequestException("Insufficient stock for cancellation..");
                    inventory.Quantity -= request.Amount;
                    quantityChange = -request.Amount;
                    break;

                case "Adjust":
                    if (request.Amount < inventory.QuantityReserved)
                        throw new BadRequestException($"Cannot set quantity less than current quantity ({inventory.QuantityReserved}).");
                    quantityChange = request.Amount - inventory.Quantity;
                    inventory.Quantity = request.Amount;
                    break;

                default:
                    throw new BadRequestException("Invalid update type.");
            }

            inventory.LastUpdated = DateTime.UtcNow;

            var history = new InventoryHistory
            {
                Id = Guid.NewGuid(),
                InventoryId = inventory.Id,
                ActionType = request.Type,       // Import/Export/Adjust
                QuantityChange = quantityChange,
                RemainingQuantity = inventory.Quantity,
                Note = request.Note,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                await _inventoryRepository.UpdateAsync(inventory);
                await _inventoryRepository.AddHistoryAsync(history);

                await _inventoryRepository.SaveChangesAsync();
            }
            catch (ConcurrencyDomainException)
            {
                throw new ConflictException("Inventory data has been changed by another transaction. Please reload the page.");
            }
        }
    }
}
