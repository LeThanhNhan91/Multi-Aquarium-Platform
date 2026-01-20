using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces.Store;

namespace Aquarium.Infrastructure.Security
{
    public class StoreContext : IStoreContext
    {
        public Guid? StoreId { get; set; }
    }
}
