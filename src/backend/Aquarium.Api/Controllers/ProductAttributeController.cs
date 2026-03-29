using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Api.Controllers
{
    [Route("api/products/{productId}/attributes")]
    [ApiController]
    [Authorize]
    public class ProductAttributeController : ControllerBase
    {
        private readonly MultiStoreAquariumDBContext _db;

        public ProductAttributeController(MultiStoreAquariumDBContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Get all attributes for a product
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAttributes(Guid productId)
        {
            var attrs = await _db.ProductAttributes
                .Where(a => a.ProductId == productId)
                .OrderBy(a => a.AttributeKey)
                .Select(a => new
                {
                    a.Id,
                    a.AttributeKey,
                    a.AttributeValue
                })
                .ToListAsync();

            return Ok(new { success = true, data = attrs });
        }

        /// <summary>
        /// Bulk upsert attributes for a product. 
        /// Accepts an array of { attributeKey, attributeValue }.
        /// Replaces all existing attributes with the provided set.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> UpsertAttributes(Guid productId, [FromBody] List<AttributeInput> input)
        {
            var product = await _db.Products.FindAsync(productId);
            if (product == null) return NotFound(new { success = false, message = "Product not found" });

            // Remove all existing attributes
            var existing = await _db.ProductAttributes
                .Where(a => a.ProductId == productId)
                .ToListAsync();
            _db.ProductAttributes.RemoveRange(existing);

            // Add new attributes
            var newAttrs = input
                .Where(i => !string.IsNullOrWhiteSpace(i.AttributeKey) && !string.IsNullOrWhiteSpace(i.AttributeValue))
                .Select(i => new ProductAttribute
                {
                    ProductId = productId,
                    AttributeKey = i.AttributeKey.Trim(),
                    AttributeValue = i.AttributeValue.Trim()
                })
                .ToList();

            await _db.ProductAttributes.AddRangeAsync(newAttrs);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Attributes updated",
                data = newAttrs.Select(a => new { a.Id, a.AttributeKey, a.AttributeValue })
            });
        }

        /// <summary>
        /// Delete a single attribute
        /// </summary>
        [HttpDelete("{attributeId}")]
        public async Task<IActionResult> DeleteAttribute(Guid productId, Guid attributeId)
        {
            var attr = await _db.ProductAttributes
                .FirstOrDefaultAsync(a => a.Id == attributeId && a.ProductId == productId);

            if (attr == null) return NotFound(new { success = false, message = "Attribute not found" });

            _db.ProductAttributes.Remove(attr);
            await _db.SaveChangesAsync();

            return Ok(new { success = true, message = "Attribute deleted" });
        }
    }

    public class AttributeInput
    {
        public string AttributeKey { get; set; }
        public string AttributeValue { get; set; }
    }
}
