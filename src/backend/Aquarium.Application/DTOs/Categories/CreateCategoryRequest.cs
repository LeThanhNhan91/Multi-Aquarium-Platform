using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Aquarium.Application.DTOs.Categories
{
    public class CreateCategoryRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public Guid? ParentId { get; set; }
    }

    public class UpdateCategoryParentRequest
    {
        public Guid? ParentId { get; set; }
    }
}
