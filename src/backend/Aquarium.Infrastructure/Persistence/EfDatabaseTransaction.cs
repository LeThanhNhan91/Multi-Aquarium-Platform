using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace Aquarium.Infrastructure.Persistence
{
    public class EfDatabaseTransaction : IDatabaseTransaction
    {
        private readonly IDbContextTransaction _transaction;

        public EfDatabaseTransaction(IDbContextTransaction transaction)
        {
            _transaction = transaction;
        }

        public async Task CommitAsync()
        {
            await _transaction.CommitAsync();
        }

        public async Task RollbackAsync()
        {
            await _transaction.RollbackAsync();
        }

        public void Dispose()
        {
            _transaction.Dispose();
        }
    }
}
