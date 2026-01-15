using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Aquarium.Application.DTOs.StoreMember
{
    public class AddStoreMemberRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression("Manager|Staff", ErrorMessage = "Role must be 'Manager' or 'Staff'.")]
        public string Role { get; set; } = "Staff";
    }
}
