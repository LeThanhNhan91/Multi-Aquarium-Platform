using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Inventory;
using FluentValidation;

namespace Aquarium.Application.Validators
{
    public class UpdateStockRequestValidator : AbstractValidator<UpdateStockRequest>
    {
        public UpdateStockRequestValidator()
        {
            // 1. Validate Amount (Amount)
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Amount must be more than 0.");

            // 2. Validate Action type (Type)
            var allowedTypes = new[] { "Import", "Export", "Adjust" };

            RuleFor(x => x.Type)
                .Must(type => allowedTypes.Contains(type))
                .WithMessage("Invalid action type. Only accept: Import, Export, Adjust.");

            // 3. BUSINESS RULE: MANDATORY CONDITIONS
            // If it's a shipment for disposal (dead/spoiled fish) -> A note is REQUIRED.
            When(x => x.Type == "Export", () =>
            {
                RuleFor(x => x.Note)
                    .NotEmpty().WithMessage("The reason for discarding/returning goods from the warehouse must be clearly stated (e.g., dead fish, broken tank).")
                    .MinimumLength(5).WithMessage("The reason is too short, please provide more details.");
            });

            // Adjust -> should have note
            When(x => x.Type == "Adjust", () =>
            {
                RuleFor(x => x.Note)
                   .NotEmpty().WithMessage("Please note the reason for the inventory adjustment (e.g., Periodic inventory check).");
            });
        }
    }
}
