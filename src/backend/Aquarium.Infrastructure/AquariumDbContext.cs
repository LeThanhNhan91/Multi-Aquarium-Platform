using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure
{
    public class AquariumDbContext : DbContext
    {
        public AquariumDbContext(DbContextOptions<AquariumDbContext> options) : base(options) { }

        //Define DbSets for entities here.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
