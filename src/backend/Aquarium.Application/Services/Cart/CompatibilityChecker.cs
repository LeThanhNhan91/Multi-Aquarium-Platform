using System;
using System.Collections.Generic;
using System.Linq;
using Aquarium.Application.DTOs.Cart;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Services.Cart
{
    /// <summary>
    /// Stateless service that checks fish compatibility based on product attributes.
    /// Rules:
    /// 1. WaterType conflict: Freshwater vs Saltwater
    /// 2. Temperament conflict: Peaceful + Aggressive/Predator, Semi-Aggressive + Predator
    /// 3. Temperature conflict: No overlap in [MinTemp, MaxTemp] ranges
    /// </summary>
    public class CompatibilityChecker
    {
        private static readonly Dictionary<string, HashSet<string>> TemperamentConflicts = new()
        {
            ["Peaceful"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Aggressive", "Predator" },
            ["Semi-Aggressive"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Predator" },
            ["Aggressive"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Peaceful" },
            ["Predator"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Peaceful", "Semi-Aggressive" },
        };

        public List<CompatibilityWarningDto> Check(Product newProduct, IEnumerable<Product> existingProducts)
        {
            var warnings = new List<CompatibilityWarningDto>();

            // Only check LiveFish products
            if (newProduct.Type != "LiveFish") return warnings;

            var newAttrs = newProduct.Attributes?.ToDictionary(a => a.AttributeKey, a => a.AttributeValue, StringComparer.OrdinalIgnoreCase)
                ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var existing in existingProducts)
            {
                if (existing.Type != "LiveFish") continue;
                if (existing.Id == newProduct.Id) continue;

                var existingAttrs = existing.Attributes?.ToDictionary(a => a.AttributeKey, a => a.AttributeValue, StringComparer.OrdinalIgnoreCase)
                    ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

                // 1. WaterType check
                if (newAttrs.TryGetValue("WaterType", out var newWater) &&
                    existingAttrs.TryGetValue("WaterType", out var existingWater))
                {
                    if (!string.Equals(newWater, existingWater, StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(newWater, "Brackish", StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(existingWater, "Brackish", StringComparison.OrdinalIgnoreCase))
                    {
                        warnings.Add(new CompatibilityWarningDto
                        {
                            ProductId = newProduct.Id,
                            ProductName = newProduct.Name,
                            ConflictWithProductId = existing.Id,
                            ConflictWithProductName = existing.Name,
                            WarningType = "WaterType",
                            Message = $"\"{newProduct.Name}\" ({newWater}) và \"{existing.Name}\" ({existingWater}) sống ở môi trường nước khác nhau."
                        });
                    }
                }

                // 2. Temperament check
                if (newAttrs.TryGetValue("Temperament", out var newTemp) &&
                    existingAttrs.TryGetValue("Temperament", out var existingTemp))
                {
                    if (TemperamentConflicts.TryGetValue(newTemp, out var conflicts) &&
                        conflicts.Contains(existingTemp))
                    {
                        warnings.Add(new CompatibilityWarningDto
                        {
                            ProductId = newProduct.Id,
                            ProductName = newProduct.Name,
                            ConflictWithProductId = existing.Id,
                            ConflictWithProductName = existing.Name,
                            WarningType = "Temperament",
                            Message = $"\"{newProduct.Name}\" ({GetVietnameseTemperament(newTemp)}) có thể xung khắc với \"{existing.Name}\" ({GetVietnameseTemperament(existingTemp)})."
                        });
                    }
                }

                // 3. Temperature range overlap check
                if (newAttrs.TryGetValue("MinTemp", out var newMinStr) &&
                    newAttrs.TryGetValue("MaxTemp", out var newMaxStr) &&
                    existingAttrs.TryGetValue("MinTemp", out var exMinStr) &&
                    existingAttrs.TryGetValue("MaxTemp", out var exMaxStr))
                {
                    if (double.TryParse(newMinStr, out var newMin) &&
                        double.TryParse(newMaxStr, out var newMax) &&
                        double.TryParse(exMinStr, out var exMin) &&
                        double.TryParse(exMaxStr, out var exMax))
                    {
                        // No overlap: newMax < exMin OR newMin > exMax
                        if (newMax < exMin || newMin > exMax)
                        {
                            warnings.Add(new CompatibilityWarningDto
                            {
                                ProductId = newProduct.Id,
                                ProductName = newProduct.Name,
                                ConflictWithProductId = existing.Id,
                                ConflictWithProductName = existing.Name,
                                WarningType = "Temperature",
                                Message = $"\"{newProduct.Name}\" ({newMin}-{newMax}°C) và \"{existing.Name}\" ({exMin}-{exMax}°C) yêu cầu khoảng nhiệt độ không tương thích."
                            });
                        }
                    }
                }
            }

            return warnings;
        }

        private static string GetVietnameseTemperament(string temperament)
        {
            return temperament?.ToLower() switch
            {
                "peaceful" => "Hiền",
                "semi-aggressive" => "Nửa dữ",
                "aggressive" => "Dữ",
                "predator" => "Ăn thịt",
                _ => temperament ?? ""
            };
        }
    }
}
