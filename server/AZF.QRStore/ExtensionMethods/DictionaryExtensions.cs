using System.Text;

// ReSharper disable once CheckNamespace
namespace System.Collections.Generic
{
    public static class DictionaryExtensions
    {
        public static string ToJson(this Dictionary<string, string> jsonParameters)
        {
            var sb = new StringBuilder();
            sb.AppendLine("{");
            foreach (var prmPair in jsonParameters)
            {
                sb.Append("\"");
                sb.Append(prmPair.Key);
                sb.Append("\" : \"");
                sb.Append(prmPair.Value);
                sb.Append("\",");
                sb.AppendLine();
            }

            sb.AppendLine("}");

            return sb.ToString();
        }
    }
}
