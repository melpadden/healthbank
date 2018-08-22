using System;
using System.Collections.Generic;
using System.Text;

namespace AZF.QRStore.WebServices
{
    public abstract class WebServiceBase
    {
    }

    public interface IWebServiceClient
    {
        string BaseUrl { get; }

    }

    public interface IHciWebServiceClient : IWebServiceClient
    {
        HciCustomHeaders HciCustomHeaders { get; set; }
    }

    public struct WebServiceHeaders
    {
        public string AUTHORITY { get; set; }
        public string ACCEPT_LANGUAGE { get; set; }
        public string ACCEPT { get; set; }

        public Dictionary<string, string> GetHeaderCollection()
        {
            var customHeaders = new Dictionary<string, string>();

            customHeaders.Add("authority", AUTHORITY);
            customHeaders.Add("accept", ACCEPT);
            customHeaders.Add("accept-language", ACCEPT_LANGUAGE);

            return customHeaders;
        }
    }

    public struct HciCustomHeaders
    {
        public string HCI_CUSTOMERID { get; set; }

        public string HCI_INDEX { get; set; }

        public string HCI_SOFTWARE { get; set; }

        public string HCI_SOFTWAREORG{ get; set; }

        public string HCI_SOFTWAREORGID { get; set; }

        public Dictionary<string, string> GetHeaderCollection()
        {
            var customHeaders = new Dictionary<string, string>();

            customHeaders.Add("hci-customerid", HCI_CUSTOMERID);
            customHeaders.Add("hci-index", HCI_INDEX);
            customHeaders.Add("hci-software", HCI_SOFTWARE);
            customHeaders.Add("hci-softwareorg", HCI_SOFTWAREORG);
            customHeaders.Add("hci-softwareorgid", HCI_SOFTWAREORGID);

            return customHeaders;

        }
    }
}
