using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.StoreMember
{
    public record StoreMemberResponse(
    Guid UserId,
    string FullName,
    string Email,
    string Role, // Role in Store (Owner/Manager/Staff)
    DateTime JoinedAt
    );
}
