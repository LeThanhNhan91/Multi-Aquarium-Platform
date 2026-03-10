using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Domain.Constants
{
    public static class OrderStatus
    {
        public const string Pending = "Pending";
        public const string Confirmed = "Confirmed";
        public const string Processing = "Processing";
        public const string Shipping = "Shipping";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";
    }

    public static class PaymentsStatus
    {
        public const string Unpaid = "Unpaid";
        public const string Paid = "Paid";
        public const string Refunded = "Refunded";
        public const string Failed = "Failed";
    }
}
