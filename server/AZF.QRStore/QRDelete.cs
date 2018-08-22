
using System;
using System.IO;
using AZF.QRStore.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;

namespace AZF.QRStore
{
    public static class QRDelete
    {
        [FunctionName(nameof(QRDelete))]
        public static IActionResult Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = null)]HttpRequest req,
            string identityReference,
            string qrCode,
            TraceWriter log)
        {
            log.Info($"DELETE function call at {DateTime.Now}");
            log.Info($"{nameof(identityReference)} = {identityReference}");
            log.Info($"{nameof(qrCode)} = {qrCode}");

            string name = req.Query["name"];

            string requestBody = new StreamReader(req.Body).ReadToEnd();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            name = name ?? data?.name;

            return name != null
                ? (ActionResult)new OkObjectResult($"Hello, {name}")
                : new BadRequestObjectResult("Please pass a name on the query string or in the request body");
        }
    }
}
