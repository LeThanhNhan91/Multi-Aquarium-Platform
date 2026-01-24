using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Common;
using Aquarium.Application.DTOs.Products;

namespace Aquarium.Application.Interfaces.Products
{
    public interface IProductService
    {
        Task<ProductResponse> CreateProductAsync(CreateProductRequest request, Guid userId);
        Task<ProductResponse> GetProductByIdAsync(Guid id);
        Task<PagedResult<ProductResponse>> GetProductsAsync(GetProductsFilter filter);
        Task DeleteProductAsync(Guid productId, Guid userId);
    }
}
