using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces;
using BCrypt.Net;

namespace Aquarium.Infrastructure.Security
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);

        public bool verifyPassword(string password, string hashedPassword) => BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}
