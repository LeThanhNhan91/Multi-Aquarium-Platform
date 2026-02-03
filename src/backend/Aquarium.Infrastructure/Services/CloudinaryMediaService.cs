using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Media;
using Aquarium.Application.Interfaces.Media;
using Aquarium.Infrastructure.Config;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Aquarium.Infrastructure.Services
{
    public class CloudinaryMediaService : IMediaService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryMediaService(IOptions<CloudinarySettings> config)
        {
            // Initialize Cloudinary Account from config
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(account);
        }

        public async Task<MediaUploadResult> UploadImageAsync(IFormFile file)
        {
            if (file.Length == 0) throw new ArgumentException("Empty file");

            var uploadResult = new ImageUploadResult();

            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Transformation = new Transformation().Width(1000).Crop("limit"),
                    Folder = "aquarium-products"
                };

                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            if (uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);
            }

            return new MediaUploadResult(uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
        }

        public async Task<MediaUploadResult> UploadVideoAsync(IFormFile file)
        {
            if (file.Length == 0) throw new ArgumentException("Empty file");

            var uploadResult = new VideoUploadResult();

            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new VideoUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "aquarium-videos",
                    EagerTransforms = new List<Transformation>()
                    {
                        new EagerTransformation().Width(300).Height(300).Crop("pad")
                    }
                };

                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            if (uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);
            }

            return new MediaUploadResult(uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
        }

        public async Task DeleteMediaAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);
            await _cloudinary.DestroyAsync(deleteParams);
        }
    }
}
