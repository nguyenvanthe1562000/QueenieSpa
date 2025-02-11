﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ShopVT.Extensions
{
    public static class JwtRegisteredClaimExtension
    {
        public const string UserId = "UserId";
        public const string UserCode = "UserCode";
        public const string EmpCode = "EmployeeCode";
        public const string FulName = "FullName";

        public const string CustomerId = "CustomerId";
        public const string CustomerCode = "CustomerId";
    }
    
}
