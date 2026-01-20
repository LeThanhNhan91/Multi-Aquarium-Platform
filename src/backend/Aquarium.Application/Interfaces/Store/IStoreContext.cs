using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.Interfaces.Store
{
    public interface IStoreContext
    {
        Guid? StoreId { get; set; }
    }
}
