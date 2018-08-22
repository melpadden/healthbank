using System;
using System.Collections.Generic;
using System.Text;

namespace AZF.QRStore.Interfaces
{
    public interface IBlobEntity
    {
        string Identifier { get; set; }
        string FileName { get; set; }

    }
}
