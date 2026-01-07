using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}
