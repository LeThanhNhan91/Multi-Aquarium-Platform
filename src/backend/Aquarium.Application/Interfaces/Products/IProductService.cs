using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Products;
using Aquarium.Application.Wrappers;

namespace Aquarium.Application.Interfaces.Products
{
    public interface IProductService
    {
        Task<ProductResponse> CreateProductAsync(CreateProductRequest request, Guid userId);
        Task<ProductResponse> GetProductByIdAsync(Guid id, Guid? userId = null);
        Task<PagedResult<ProductResponse>> GetProductsAsync(GetProductsFilter filter, Guid? userId = null);
        Task<PagedResult<ProductResponse>> GetMyStoreProductsAsync(Guid storeId, Guid userId, GetProductsFilter filter);
        Task<ProductResponse> UpdateProductAsync(Guid productId, UpdateProductRequest request, Guid userId);
        Task DeleteProductAsync(Guid productId, Guid userId);
        Task<ProductApprovalResponse> ApproveProductAsync(Guid productId, Guid adminUserId, ApproveProductRequest request);
        Task<ProductApprovalResponse> RejectProductAsync(Guid productId, Guid adminUserId, RejectProductRequest request);
    }
}
