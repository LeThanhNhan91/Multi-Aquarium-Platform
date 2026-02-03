using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Posts;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Media;
using Aquarium.Application.Interfaces.Posts;
using Aquarium.Domain.Constants;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IMediaService _mediaService;
        private readonly IStoreRepository _storeRepository;

        public PostService(
            IPostRepository postRepository,
            IMediaService mediaService,
            IStoreRepository storeRepository)
        {
            _postRepository = postRepository;
            _mediaService = mediaService;
            _storeRepository = storeRepository;
        }

        public async Task<PostResponse> CreatePostAsync(CreatePostRequest request, Guid userId)
        {
            var member = await _storeRepository.GetStoreUserAsync(request.StoreId, userId);

            if (member == null || !StoreRoles.AllRoles.Contains(member.Role))
            {
                throw new UnauthorizedAccessException("You do not have permission to post for this Store.");
            }

            var post = new StorePost
            {
                Id = Guid.NewGuid(),
                StoreId = request.StoreId,
                Content = request.Content,
                CreatedAt = DateTime.UtcNow
            };

            var responseMedia = new List<PostMediaDto>();

            if (request.MediaFiles != null && request.MediaFiles.Any())
            {
                foreach (var file in request.MediaFiles)
                {
                    string mediaUrl;
                    string mediaType;

                    if (file.ContentType.ToLower().Contains("video"))
                    {
                        var uploadResult = await _mediaService.UploadVideoAsync(file);
                        mediaUrl = uploadResult.Url;
                        mediaType = "Video";
                    }
                    else
                    {
                        var uploadResult = await _mediaService.UploadImageAsync(file);
                        mediaUrl = uploadResult.Url;
                        mediaType = "Image";
                    }

                    post.PostMedia.Add(new PostMedia
                    {
                        Id = Guid.NewGuid(),
                        PostId = post.Id,
                        MediaUrl = mediaUrl,
                        MediaType = mediaType
                    });

                    responseMedia.Add(new PostMediaDto { Url = mediaUrl, Type = mediaType });
                }
            }

            await _postRepository.AddAsync(post);
            await _postRepository.SaveChangesAsync();

            return new PostResponse
            {
                Id = post.Id,
                StoreId = post.StoreId,
                Content = post.Content,
                CreatedAt = post.CreatedAt ?? DateTime.UtcNow,
                Media = responseMedia
            };
        }

        private string GetPublicIdFromUrl(string url)
        {
            if (string.IsNullOrEmpty(url)) return null;
            try
            {
                var uri = new Uri(url);
                var path = uri.AbsolutePath;

                var segments = uri.Segments;

                return null;
            }
            catch { return null; }
        }

        public async Task DeletePostAsync(Guid postId, Guid userId)
        {
            var post = await _postRepository.GetByIdWithMediaAsync(postId);
            if (post == null) throw new KeyNotFoundException("No Post Exist.");

            var member = await _storeRepository.GetStoreUserAsync(post.StoreId, userId);
            if (member == null || !StoreRoles.AllRoles.Contains(member.Role))
                throw new UnauthorizedAccessException("You have no permission to delete this post.");

            foreach (var media in post.PostMedia)
            {
            }

            await _postRepository.DeleteAsync(post);
            await _postRepository.SaveChangesAsync();
        }

        public async Task<PostResponse> UpdatePostAsync(Guid postId, UpdatePostRequest request, Guid userId)
        {
            var post = await _postRepository.GetByIdWithMediaAsync(postId);
            if (post == null) throw new KeyNotFoundException("Bài viết không tồn tại.");

            var member = await _storeRepository.GetStoreUserAsync(post.StoreId, userId);
            if (member == null || !StoreRoles.AllRoles.Contains(member.Role))
                throw new UnauthorizedAccessException("Không có quyền sửa bài viết này.");

            post.Content = request.Content;

            if (request.MediaIdsToDelete != null && request.MediaIdsToDelete.Any())
            {
                var mediaToDelete = post.PostMedia
                    .Where(m => request.MediaIdsToDelete.Contains(m.Id))
                    .ToList();

                foreach (var media in mediaToDelete)
                {
                    post.PostMedia.Remove(media);
                }
            }

            if (request.NewMediaFiles != null && request.NewMediaFiles.Any())
            {
                foreach (var file in request.NewMediaFiles)
                {
                    string url, type;
                    if (file.ContentType.ToLower().Contains("video"))
                    {
                        var result = await _mediaService.UploadVideoAsync(file);
                        url = result.Url;
                        type = "Video";
                    }
                    else
                    {
                        var result = await _mediaService.UploadImageAsync(file);
                        url = result.Url;
                        type = "Image";
                    }

                    post.PostMedia.Add(new PostMedia
                    {
                        Id = Guid.NewGuid(),
                        PostId = post.Id,
                        MediaUrl = url,
                        MediaType = type
                    });
                }
            }

            await _postRepository.SaveChangesAsync();

            return new PostResponse
            {
                Id = post.Id,
                StoreId = post.StoreId,
                Content = post.Content,
                CreatedAt = post.CreatedAt ?? DateTime.UtcNow,
                Media = post.PostMedia.Select(m => new PostMediaDto { Url = m.MediaUrl, Type = m.MediaType }).ToList()
            };
        }
    }
}
