using Aquarium.Application.Interfaces;
using Aquarium.Infrastructure.Persistence;
using Aquarium.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Config DbContext
builder.Services.AddDbContext<MultiStoreAquariumDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var connString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Connection String: {connString}");

// 2. Register for services (Dependency Injection)
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

// 3. Support Controller and OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 4. Configure the HTTP processing pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();