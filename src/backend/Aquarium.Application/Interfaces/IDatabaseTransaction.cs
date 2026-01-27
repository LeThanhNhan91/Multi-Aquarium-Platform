using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.Interfaces
{
    public interface IDatabaseTransaction : IDisposable
    {
        Task CommitAsync();
        Task RollbackAsync();
    }
}
