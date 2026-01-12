using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Domain.Exceptions
{
    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message) : base(message) { }
    }
}
