using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Media;
using Aquarium.Application.DTOs.Posts;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Media;
using Aquarium.Application.Interfaces.Posts;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Constants;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IMediaService _mediaService;
        private readonly IStoreRepository _storeRepository;
        private readonly IUserRepository _userRepository;

        public PostService(
            IPostRepository postRepository,
            IMediaService mediaService,
            IStoreRepository storeRepository,
            IUserRepository userRepository)
        {
            _postRepository = postRepository;
            _mediaService = mediaService;
            _storeRepository = storeRepository;
            _userRepository = userRepository;
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
                if (!string.IsNullOrEmpty(media.PublicId))
                {
                    await _mediaService.DeleteMediaAsync(media.PublicId);
                }
            }

            await _postRepository.DeleteAsync(post);
            await _postRepository.SaveChangesAsync();
        }

        public async Task<PostResponse> UpdatePostAsync(Guid postId, UpdatePostRequest request, Guid userId)
        {
            var post = await _postRepository.GetByIdWithMediaAsync(postId);
            if (post == null) throw new KeyNotFoundException("No Post Exist.");

            var member = await _storeRepository.GetStoreUserAsync(post.StoreId, userId);
            if (member == null || !StoreRoles.AllRoles.Contains(member.Role))
                throw new UnauthorizedAccessException("You have no permission to edit this post.");

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
                    MediaUploadResult uploadResult;
                    string mediaType;

                    if (file.ContentType.ToLower().Contains("video"))
                    {
                        uploadResult = await _mediaService.UploadVideoAsync(file);
                        mediaType = "Video";
                    }
                    else
                    {
                        uploadResult = await _mediaService.UploadImageAsync(file);
                        mediaType = "Image";
                    }

                    post.PostMedia.Add(new PostMedia
                    {
                        Id = Guid.NewGuid(),
                        PostId = post.Id,
                        MediaUrl = uploadResult.Url,
                        MediaType = mediaType,
                        PublicId = uploadResult.PublicId
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

        public async Task<PagedResult<PostFeedDto>> GetNewsFeedAsync(int pageIndex, int pageSize, Guid currentUserId)
        {
            var (posts, totalCount) = await _postRepository.GetNewsFeedAsync(pageIndex, pageSize);

            var items = posts.Select(p => new PostFeedDto
            {
                Id = p.Id,
                StoreId = p.StoreId,
                StoreName = p.Store.Name,
                Content = p.Content,
                CreatedAt = p.CreatedAt ?? DateTime.UtcNow,
                Media = p.PostMedia.Select(m => new PostMediaDto { Url = m.MediaUrl, Type = m.MediaType }).ToList(),

                // Stats
                LikeCount = p.Likes.Count,
                CommentCount = p.Comments.Count,

                IsLikedByCurrentUser = p.Likes.Any(l => l.UserId == currentUserId)
            }).ToList();

            return new PagedResult<PostFeedDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<bool> ToggleLikeAsync(Guid postId, Guid userId)
        {
            var existingLike = await _postRepository.GetLikeAsync(postId, userId);

            if (existingLike != null)
            {
                await _postRepository.RemoveLikeAsync(existingLike);
                await _postRepository.SaveChangesAsync();
                return false; // New status: Unliked
            }
            else
            {
                var newLike = new PostLike { PostId = postId, UserId = userId };
                await _postRepository.AddLikeAsync(newLike);
                await _postRepository.SaveChangesAsync();
                return true; // New status: Liked
            }
        }

        public async Task<CommentDto> AddCommentAsync(Guid postId, string content, Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            var comment = new PostComment
            {
                Id = Guid.NewGuid(),
                PostId = postId,
                UserId = userId,
                Content = content,
                CreatedAt = DateTime.UtcNow
            };

            await _postRepository.AddCommentAsync(comment);
            await _postRepository.SaveChangesAsync();

            return new CommentDto
            {
                Id = comment.Id,
                UserId = userId,
                UserName = user?.FullName ?? "Unknown",
                Content = comment.Content,
                CreatedAt = comment.CreatedAt
            };
        }

        public async Task<PagedResult<CommentDto>> GetCommentsAsync(Guid postId, int pageIndex, int pageSize)
        {
            var (comments, totalCount) = await _postRepository.GetCommentsAsync(postId, pageIndex, pageSize);

            var items = comments.Select(c => new CommentDto
            {
                Id = c.Id,
                UserId = c.UserId,
                UserName = c.User?.FullName ?? "Unknown",
                Content = c.Content,
                CreatedAt = c.CreatedAt
            }).ToList();

            return new PagedResult<CommentDto>(items, totalCount, pageIndex, pageSize);
        }
    }
}
