using System;
using System.Collections.Generic;
using System.Text;

namespace AZF.QRStore.UnitTests.TestModels
{
    public class IdentityDocument
    {
        public DateTime Expiry { get; set; }
        public string IdentityReference { get; set; }
    }
}
