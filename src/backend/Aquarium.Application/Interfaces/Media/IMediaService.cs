using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Media;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.Interfaces.Media
{
    public interface IMediaService
    {
        Task<MediaUploadResult> UploadImageAsync(IFormFile file);

        Task<MediaUploadResult> UploadVideoAsync(IFormFile file);

        Task DeleteMediaAsync(string publicId);
    }
}
