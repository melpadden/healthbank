using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using AZF.QRStore.Interfaces;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace AZF.QRStore.Data
{
    public class BlobRepository<TEntity> : IASyncRepository<TEntity> where TEntity : IBlobEntity
    {
        private readonly string _connectionString;
        private readonly string _containerReference;
        CloudStorageAccount _storageAccount = null;
        CloudBlobContainer _cloudBlobContainer = null;


        public BlobRepository(string connectionString, string containerReference)
        {
            _connectionString = connectionString;
            _containerReference = containerReference;
        }

        public async Task InsertASync(TEntity entity)
        {
            if (CloudStorageAccount.TryParse(_connectionString, out _storageAccount))
            {
                try
                {
                    // Create the CloudBlobClient that represents the Blob storage endpoint for the storage account.
                    CloudBlobClient cloudBlobClient = _storageAccount.CreateCloudBlobClient();

                    // Create a container called 'quickstartblobs' and append a GUID value to it to make the name unique. 
                    _cloudBlobContainer = cloudBlobClient.GetContainerReference(_connectionString);
                    await _cloudBlobContainer.CreateAsync();
                    
                    // Set the permissions so the blobs are public. 
                    BlobContainerPermissions permissions = new BlobContainerPermissions
                    {
                        PublicAccess = BlobContainerPublicAccessType.Blob
                    };
                    await _cloudBlobContainer.SetPermissionsAsync(permissions);

                    // Get a reference to the blob address, then upload the file to the blob.
                    // Use the value of localFileName for the blob name.
                    CloudBlockBlob cloudBlockBlob = _cloudBlobContainer.GetBlockBlobReference((string)entity.Identifier);
                    await cloudBlockBlob.UploadFromFileAsync(entity.FileName);

                }
                catch (StorageException ex)
                {
                    Console.WriteLine("Error returned from the service: {0}", ex.Message);
                }
                finally
                {
                    
                }
            }
            else
            {
                throw new ApplicationException($"Connection string {_connectionString} could not be parsed.");
            }
        }

        public Task UpdateASync(TEntity entity)
        {
            throw new NotImplementedException();
        }

        public Task DeleteASync(TEntity entity)
        {
            throw new NotImplementedException();
        }

        public TEntity GetASync(object key)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<TEntity> SearchASync(Func<TEntity, bool> predicate)
        {
            throw new NotImplementedException();
        }
    }
}
