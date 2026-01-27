using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Common;
using Aquarium.Application.DTOs.Products;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Products
{
    public interface IProductRepository
    {
        Task AddAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Product product);
        Task<Product?> GetByIdAsync(Guid id);
        Task<PagedResult<Product>> GetProductsByFilterAsync(GetProductsFilter filter);
        Task<List<Product>> GetByIdsAsync(List<Guid> ids);
        Task<bool> SaveChangesAsync();
    }
}
