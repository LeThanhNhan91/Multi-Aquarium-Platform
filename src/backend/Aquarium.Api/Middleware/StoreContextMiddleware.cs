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

    public async Task InvokeAsync(HttpContext context, IStoreContext storeContext, ILogger<StoreContextMiddleware> logger)
    {
        // 1. Get StoreId From Header (X-Store-Id)
        if (context.Request.Headers.TryGetValue("X-Store-Id", out var headerStoreId))
        {
            if (Guid.TryParse(headerStoreId, out var parsedStoreId))
            {
                storeContext.StoreId = parsedStoreId;
                logger.LogInformation($"StoreId resolved from X-Store-Id header: {parsedStoreId}");
            }
        }

        // 2. Get StoreId From Route URL (exp: /api/stores/{storeId}/...)
        var routeData = context.GetRouteData();
        if (storeContext.StoreId == null && routeData.Values.TryGetValue("storeId", out var routeStoreId))
        {
            if (Guid.TryParse(routeStoreId?.ToString(), out var storeId))
            {
                storeContext.StoreId = storeId;
                logger.LogInformation($"StoreId resolved from route URL: {storeId}");
            }
        }

        // 3. If no Route, get storeId from JWT Claims (already in User after Auth)
        if (storeContext.StoreId == null && context.User.Identity?.IsAuthenticated == true)
        {
            var storeIdClaim = context.User.FindFirst("storeId")?.Value 
                              ?? context.User.FindFirst("StoreId")?.Value;
            if (Guid.TryParse(storeIdClaim, out var claimStoreId))
            {
                storeContext.StoreId = claimStoreId;
                logger.LogInformation($"StoreId resolved from JWT claims: {claimStoreId}");
            }
        }

        // 4. Ensure the header is present for downstream use and client visibility
        if (storeContext.StoreId != null)
        {
            var storeIdStr = storeContext.StoreId.ToString();
            
            // Add to request header if not present (for downstream services/controllers)
            if (!context.Request.Headers.ContainsKey("X-Store-Id"))
            {
                context.Request.Headers["X-Store-Id"] = storeIdStr;
            }

            // Add to response header so frontend can confirm the context
            context.Response.Headers["X-Store-Id"] = storeIdStr;
        }
        else
        {
            logger.LogWarning("StoreId could not be resolved. Ensure X-Store-Id header, route, or JWT claims are set correctly.");
        }

        await _next(context);
    }
}