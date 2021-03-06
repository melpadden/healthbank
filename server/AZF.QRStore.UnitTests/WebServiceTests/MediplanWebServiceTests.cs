﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using AZF.QRStore.WebServices;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AZF.QRStore.UnitTests
{
    [TestClass]
    public class MediplanWebServiceTests
    {
        private const string MediplanWebServiceUrl = "https://documedis.hcisolutions.ch/app/medication/medicationplan";

        private const string 
            RequestBody =
                @"{""medication"":""CHMED16A1H4sIAAAAAAAAC7VTwW7CMAz9l1zXojiQAr2NVSAk2BBjO2zi0LURraApStNJDPXPuPFjcxrKdkCamLZDpdf3HPvZsvdkFupUSE38PRneh5kgPglyFRKHTE6/IxW+CYXEIMAwAv0OdwFc1kZqJGSMms8c8qiVECYA6Zd0a8FdqncWTeQKQSwQzpJcmsQIpyI2lYNJoadCWm4eEf91T8aodCrHAtYAaEC7ARxf4AMP+LKhPEvxLiyrpSkSFnXKxW6LdcEhz+EGa/VNB08y1af8VmaNDB4/61Atq6q2m0Y4FaltQlOM8H6PU4wcxzZBBzvMrR7oocozjGEUui7lLmUYGKAGLerQr6/2aUvhINcYtFiv5oWZyGBT6iSPkliVkRHmeYjs7IE03RIA5nU7/LcW4GcLYRklxVakUSI2sToeCnHZCO0B53CtEdrifziLHvf69P9m8RglmVAfuKyXyrcZh6v7v24X3oWKjwcpSzyo7xbw0QzNicwQ9rTO+157Q+4Wx2dRfcpnJ70FMJ9Sn8INNcAkztY2Eo9hUN9w9QnaarPCLQQAAA=="",""logo"":""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"",""organization"":""healthbank, Blegistrasse 17A, 6340 Thun"" }";

        private const string
            QrCode =
                @"CHMED16A1H4sIAAAAAAAAC7VTwW7CMAz9l1zXojiQAr2NVSAk2BBjO2zi0LURraApStNJDPXPuPFjcxrKdkCamLZDpdf3HPvZsvdkFupUSE38PRneh5kgPglyFRKHTE6/IxW+CYXEIMAwAv0OdwFc1kZqJGSMms8c8qiVECYA6Zd0a8FdqncWTeQKQSwQzpJcmsQIpyI2lYNJoadCWm4eEf91T8aodCrHAtYAaEC7ARxf4AMP+LKhPEvxLiyrpSkSFnXKxW6LdcEhz+EGa/VNB08y1af8VmaNDB4/61Atq6q2m0Y4FaltQlOM8H6PU4wcxzZBBzvMrR7oocozjGEUui7lLmUYGKAGLerQr6/2aUvhINcYtFiv5oWZyGBT6iSPkliVkRHmeYjs7IE03RIA5nU7/LcW4GcLYRklxVakUSI2sToeCnHZCO0B53CtEdrifziLHvf69P9m8RglmVAfuKyXyrcZh6v7v24X3oWKjwcpSzyo7xbw0QzNicwQ9rTO+157Q+4Wx2dRfcpnJ70FMJ9Sn8INNcAkztY2Eo9hUN9w9QnaarPCLQQAAA==";

        private const string 
            Logo = 
                @"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";

        private const string Organization = "healthbank, Blegistrasse 17A, 6340 Thun";

        private static readonly HttpClient client = new HttpClient();

        [TestMethod]
        public async Task TestGetQRCode()
        {
            var customHeaders = new Dictionary<string, string>();
            //customHeaders.Add("Content-Type", "application/json");
            customHeaders.Add("Authority", "documedis.hcisolutions.ch");
            customHeaders.Add("accept-language", "de-CH");
            customHeaders.Add("Accept", "application/pdf");

            customHeaders.Add("hci-customerid", "7601001362383");
            customHeaders.Add("hci-index", "hospINDEX");
            customHeaders.Add("hci-software", "Documedis");
            customHeaders.Add("hci-softwareorg", "HCI Solutions AG");
            customHeaders.Add("hci-softwareorgid", "7601001362383");

            var parameters = new Dictionary<string, string>();
            parameters.Add("medication", QrCode);
            parameters.Add("logo", Logo);
            parameters.Add("organization", Organization);


            //var content = new FormUrlEncodedContent(parameters);
            var jsonStringParameters = parameters.ToJson();

            var content = new StringContent(jsonStringParameters, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage
            {
                RequestUri = new Uri(MediplanWebServiceUrl),
                Method = HttpMethod.Post,
                Content = content
            };

            request.Headers.Clear();
            foreach (var headerPair in customHeaders)
            {
                request.Headers.TryAddWithoutValidation(headerPair.Key, headerPair.Value);
            }

            var response = await client.SendAsync(request);
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            var pdfStream = await response.Content.ReadAsStreamAsync();
            var filePath = Assembly.GetExecutingAssembly().Location + "Test.qr.generatepdf." +
                           DateTime.Now.Ticks.ToString() + ".pdf";
            var file = File.Create(filePath);
            await pdfStream.CopyToAsync(file);
        }

        [TestMethod]
        public async Task TestGetPdf()
        {
            var customHeaders = new WebServiceHeaders();

            //customHeaders.Add("Content-Type", "application/json");
            customHeaders.AUTHORITY = "documedis.hcisolutions.ch";
            customHeaders.ACCEPT_LANGUAGE = "de-CH";
            customHeaders.ACCEPT = "application/pdf";

            var hciHeaders = new HciCustomHeaders();
            hciHeaders.HCI_CUSTOMERID = "7601001362383";
            hciHeaders.HCI_INDEX = "hospINDEX";
            hciHeaders.HCI_SOFTWARE = "Documedis";
            hciHeaders.HCI_SOFTWAREORG = "HCI Solutions AG";
            hciHeaders.HCI_SOFTWAREORGID = "7601001362383";

            var pdfService = new PdfService(MediplanWebServiceUrl, customHeaders, hciHeaders, Logo, Organization);

            var pdfStream = await pdfService.GetPdf(QrCode);

            Assert.IsNotNull(pdfStream);
        }

        //private static T MakeRequest<T>(string httpMethod, string route, Dictionary<string, string> postParams = null)
        //{
        //    using (var client = new HttpClient())
        //    {
        //        HttpRequestMessage requestMessage = new HttpRequestMessage(new HttpMethod(httpMethod), $"{_apiBaseUri}/{route}");

        //        if (postParams != null)
        //            requestMessage.Content = new FormUrlEncodedContent(postParams);   // This is where your content gets added to the request body


        //        HttpResponseMessage response = client.SendAsync(requestMessage).Result;

        //        string apiResponse = response.Content.ReadAsStringAsync().Result;
        //        try
        //        {
        //            // Attempt to deserialise the reponse to the desired type, otherwise throw an expetion with the response from the api.
        //            if (apiResponse != "")
        //                return JsonConvert.DeserializeObject<T>(apiResponse);
        //            else
        //                throw new Exception();
        //        }
        //        catch (Exception ex)
        //        {
        //            throw new Exception($"An error ocurred while calling the API. It responded with the following message: {response.StatusCode} {response.ReasonPhrase}");
        //        }
        //    }
        //}
    }
}
