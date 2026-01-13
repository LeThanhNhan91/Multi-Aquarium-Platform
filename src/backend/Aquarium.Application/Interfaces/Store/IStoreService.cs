using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Store;

namespace Aquarium.Application.Interfaces
{
    public interface IStoreService
    {
        Task<StoreResponse> CreateStoreAsync(CreateStoreRequest request, Guid userId);
    }
}
