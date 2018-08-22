using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AZF.QRStore.Interfaces;

namespace AZF.QRStore.Data
{
    public interface IRepository<TEntity> where TEntity : IBlobEntity
    {
        void Insert(TEntity entity);
        void Update(TEntity entity);
        void Delete(TEntity entity);
        TEntity Get(object key);
        IEnumerable<TEntity> Search(Func<TEntity, bool> predicate);
    }

    public interface IASyncRepository<TEntity> where TEntity : IBlobEntity
    {
        Task InsertASync(TEntity entity);
        Task UpdateASync(TEntity entity);
        Task DeleteASync(TEntity entity);
        TEntity GetASync(object key);
        IEnumerable<TEntity> SearchASync(Func<TEntity, bool> predicate);
    }
}
