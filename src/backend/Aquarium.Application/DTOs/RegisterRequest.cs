using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs;
public record RegisterRequest(
    string Email,
    string Password,
    string FullName,
    string? PhoneNumber
);
