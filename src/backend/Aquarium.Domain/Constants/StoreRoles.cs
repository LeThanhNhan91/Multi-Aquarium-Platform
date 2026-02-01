using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Domain.Constants
{
    public static class StoreRoles
    {
        public const string Owner = "Owner";
        public const string Manager = "Manager";
        public const string Staff = "Staff";

        public static readonly string[] ManagementRoles = { Owner, Manager };
        public static readonly string[] AllRoles = { Owner, Manager, Staff };
    }
}
