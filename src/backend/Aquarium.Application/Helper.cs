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
    }
}
