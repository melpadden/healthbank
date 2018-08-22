using AZF.QRStore.Data;
using AZF.QRStore.UnitTests.TestModels;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AZF.QRStore.UnitTests
{
    [TestClass]
    public class BlobRepositoryTests
    {
        private const string CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=hbqrstore;AccountKey=dCMyRF+1mRwLPgq1Wb10DpDKYgkX1Nrlhbv/VpRoLNowopfR97V1WR958Xxe4bSOzj8YgODMs5tbJ4ISfSJXhQ==";

        [TestMethod]
        public void TestInsert()
        {
            //var repository = new BlobRepository<IdentityDocument>(CONNECTION_STRING);
        }
    }
}
