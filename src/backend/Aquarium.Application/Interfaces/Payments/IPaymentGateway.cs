using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Payments;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.Interfaces.Payments
{
    public interface IPaymentGateway
    {
        // Create the VNPay URL for the user to visit
        string CreatePaymentUrl(Domain.Entities.Order order, HttpContext httpContext);

        // Verify the data returned from VNPay
        PaymentReturnDto ProcessPaymentReturn(IQueryCollection collections);
    }
}
