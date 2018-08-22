using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace AZF.QRStore.WebServices
{
    public class MetadataService
    {
        private readonly string _baseUrl;
        private WebServiceHeaders _webServiceHeaders;
        private HciCustomHeaders _hciCustomHeaders;
        private readonly string _logo;
        private readonly string _organization;
        private static readonly HttpClient Client = new HttpClient();

        public MetadataService(string baseUrl, WebServiceHeaders webServiceHeaders, HciCustomHeaders hciCustomHeaders, string logo, string organization)
        {
            _baseUrl = baseUrl;
            _webServiceHeaders = webServiceHeaders;
            _hciCustomHeaders = hciCustomHeaders;
            _logo = logo;
            _organization = organization;
        }


        public async Task<string> GetMetadata(string qrCode)
        {
            var content = new StringContent(qrCode, Encoding.UTF8, "text/plain");

            var request = new HttpRequestMessage
            {
                RequestUri = new Uri(_baseUrl),
                Method = HttpMethod.Post,
                Content = content
            };

            request.Headers.Clear();

            foreach (var headerPair in _webServiceHeaders.GetHeaderCollection())
            {
                request.Headers.TryAddWithoutValidation(headerPair.Key, headerPair.Value);
            }
            foreach (var headerPair in _hciCustomHeaders.GetHeaderCollection())
            {
                request.Headers.TryAddWithoutValidation(headerPair.Key, headerPair.Value);
            }

            var response = await Client.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            return await response.Content.ReadAsStringAsync();
        }

    }
}
