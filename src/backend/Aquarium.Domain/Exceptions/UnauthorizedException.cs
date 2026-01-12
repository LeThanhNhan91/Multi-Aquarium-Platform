using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Domain.Exceptions;

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}
