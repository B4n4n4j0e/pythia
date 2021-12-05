export function viewDataToChartName (selectedView){
    switch (selectedView) {
        case "Bar chart horizontal":
          return "BarChartHorizontal";
        case "Bar chart vertical":
          return "BarChart";
        case "Pie chart":
          return "PieChart";
        case "Line chart":
          return "LineChart";
        case "TreeMap":
          return "TreeMap";
        case "Connection table":
          return "ConnectionTable";
        case "DNS table":
          return "DNSTable";
        case "Notice table":
          return "NoticeTable";
        default:
          break;
      }
}

export function typeDataToStoreTypeData (typeData){
        switch (typeData) {
          case "DNS queries top k":
            return "dNSQueriesTopK";
          case "Origin hosts top k":
            return "originHostsTopK";
          case "Resp hosts top k":
            return "respHostsTopK";
          case "Resp ports top k":
            return "respPortsTopK";
          case "Ports of interest summary":
            return "portsOfInterest";
          case "Connections per timeunit":
            return "connectionSummary";
          case "Protocols summary":
            return "protocolSummary";
          case "Services summary":
            return "serviceSummary";
          case "Data volume summary":
            return "ipByteSummary";
          case "Data volume per timeunit":
            return "ipByteSummaryByTime";
          case "DNS table":
            return "dNSTable";
          case "Connection table":
            return "connectionTable";
          case "Notice table":
            return "noticeTable";
          default:
            break;
        }
}