# ============================================================
# Stage 1: Build
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files first (layer caching)
COPY MultiStoreAquarium.sln ./
COPY Aquarium.Api/Aquarium.Api.csproj                         Aquarium.Api/
COPY Aquarium.Application/Aquarium.Application.csproj         Aquarium.Application/
COPY Aquarium.Domain/Aquarium.Domain.csproj                   Aquarium.Domain/
COPY Aquarium.Infrastructure/Aquarium.Infrastructure.csproj   Aquarium.Infrastructure/

# Restore dependencies
RUN dotnet restore

# Copy the rest of the source code
COPY . .

# Build and publish in Release mode
RUN dotnet publish Aquarium.Api/Aquarium.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ============================================================
# Stage 2: Runtime
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create a non-root user for security (Ubuntu-based image)
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

# Copy published output
COPY --from=build /app/publish .

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Expose HTTP port (HTTPS is handled by the reverse proxy / cloud layer)
EXPOSE 8080

# ASP.NET Core listens on port 8080 inside the container
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Aquarium.Api.dll"]
