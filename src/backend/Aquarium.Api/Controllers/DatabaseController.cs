// filepath: Aquarium.Api/Controllers/DatabaseController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[ApiController]
[Route("api/[controller]")]
public class DatabaseController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public DatabaseController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("test-connection")]
    public IActionResult TestConnection()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        try
        {
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                return Ok("Database connection successful!");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Database connection failed: {ex.Message}");
        }
    }
}