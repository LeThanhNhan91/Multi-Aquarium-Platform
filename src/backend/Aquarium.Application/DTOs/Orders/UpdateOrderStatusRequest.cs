using System.ComponentModel.DataAnnotations;

namespace Aquarium.Application.DTOs.Orders
{
    public class UpdateOrderStatusRequest
    {
        [Required]
        public string Status { get; set; }
        
        public string Note { get; set; }
    }
}
