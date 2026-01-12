using System.Net;
using System.Text.Json;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Api.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Something went wrong: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = (int)HttpStatusCode.InternalServerError;
        var message = "Internal Server Error from the custom middleware.";

        switch (exception)
        {
            case UnauthorizedException:
                statusCode = (int)HttpStatusCode.Unauthorized; // 401
                message = exception.Message;
                break;

            case ForbiddenException:
                statusCode = (int)HttpStatusCode.Forbidden; // 403
                message = exception.Message;
                break;

            case BadRequestException:
                statusCode = (int)HttpStatusCode.BadRequest; // 400
                message = exception.Message;
                break;

            case NotFoundException:
                statusCode = (int)HttpStatusCode.NotFound; // 404
                message = exception.Message;
                break;

            default:
                message = exception.Message;
                break;
        }

        context.Response.StatusCode = statusCode;

        var response = new
        {
            StatusCode = statusCode,
            Message = message
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}