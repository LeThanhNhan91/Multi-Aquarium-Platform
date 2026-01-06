using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.Interfaces
{
    public interface IPasswordHasher
    {
        string HashPassword(string password);
        bool verifyPassword(string password, string hashedPassowrd);
    }
}
