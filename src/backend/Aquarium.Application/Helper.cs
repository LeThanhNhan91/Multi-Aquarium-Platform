using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Aquarium.Application
{
    public static class Helper
    {
        public static string GenerateSlug(string phrase)
        {
            if (string.IsNullOrWhiteSpace(phrase))
                return string.Empty;

            string str = phrase.ToLowerInvariant();

            // Remove Vietnamese diacritics
            str = Regex.Replace(str, @"[áàạảãâấầậẩẫăắằặẳẵ]", "a");
            str = Regex.Replace(str, @"[éèẹẻẽêếềệểễ]", "e");
            str = Regex.Replace(str, @"[óòọỏõôốồộổỗơớờợởỡ]", "o");
            str = Regex.Replace(str, @"[úùụủũưứừựửữ]", "u");
            str = Regex.Replace(str, @"[íìịỉĩ]", "i");
            str = Regex.Replace(str, @"[đ]", "d");
            str = Regex.Replace(str, @"[ýỳỵỷỹ]", "y");

            // Remove special characters
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");

            // Remove extra spaces
            str = Regex.Replace(str, @"\s+", " ").Trim();

            // Replace spaces with dash
            str = Regex.Replace(str, @"\s", "-");

            return $"{str}-{Guid.NewGuid().ToString("N")[..4]}";
        }

        /// <summary>
        /// Extract base slug without the 4-char GUID suffix
        /// Example: "ca-canh-a1b2" → "ca-canh"
        /// </summary>
        public static string GetBaseSlug(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug))
                return string.Empty;

            // Slug format: {base-slug}-{4-char-guid}
            // Find the last dash and remove the 4-char suffix
            int lastDashIndex = slug.LastIndexOf('-');
            if (lastDashIndex > 0 && slug.Length - lastDashIndex == 5) // "-xxxx"
            {
                return slug.Substring(0, lastDashIndex);
            }

            return slug; // Return as-is if format doesn't match
        }
    }
}
