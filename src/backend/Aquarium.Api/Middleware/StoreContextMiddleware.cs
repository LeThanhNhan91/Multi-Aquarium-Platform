using System.Security.Claims;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Store;

namespace Aquarium.Api.Middleware;

public class StoreContextMiddleware
{
    private readonly RequestDelegate _next;

    public StoreContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IStoreContext storeContext)
    {
        // 1. Get StoreId From Route URL (exp: /api/stores/{storeId}/...)
        var routeData = context.GetRouteData();
        if (routeData.Values.TryGetValue("storeId", out var routeStoreId))
        {
            if (Guid.TryParse(routeStoreId?.ToString(), out var storeId))
            {
                storeContext.StoreId = storeId;
            }
        }

        // 2. If no Route, get storeId from JWT Claims (already in User after Auth)
        if (storeContext.StoreId == null && context.User.Identity?.IsAuthenticated == true)
        {
            var storeIdClaim = context.User.FindFirst("StoreId")?.Value;
            if (Guid.TryParse(storeIdClaim, out var claimStoreId))
            {
                storeContext.StoreId = claimStoreId;
            }
        }

        await _next(context);
    }
}