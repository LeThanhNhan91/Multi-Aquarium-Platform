using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Domain.Exceptions
{
    public class ConcurrencyDomainException : Exception
    {
        public ConcurrencyDomainException(string message) : base(message) { }

        public ConcurrencyDomainException(string message, Exception innerException) : base(message, innerException) { }
    }
}
