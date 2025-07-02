import * as XLSX from "xlsx";

/**
 * Exports data to an Excel file.
 * @param {Array|Object} dataObject - The data to export. Can be an array of objects or a single object.
 * @param {string} [fileName="export"] - The name of the exported file (without extension).
 * @param {Array} [customHeaders] - Optional custom headers for the columns.
 */
/** */

export function downloadExcel(data, fileName = "export", customHeaders) {
  const dataArray = Array.isArray(data) ? data : [data];
  if (!dataArray.length) {
    console.warn("No data to export");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(dataArray, {
    skipHeader: true,
    origin: "A2",
  });

  XLSX.utils.sheet_add_aoa(worksheet, [customHeaders], { origin: "A1" });

  const keys = Object.keys(dataArray[0]);
  const colWidths = keys.map((key, i) => {
    const headerLen = (customHeaders[i] || key).toString().length;
    const maxDataLen = Math.max(
      ...dataArray.map(row => {
        const v = row[key];
        return v != null ? v.toString().length : 0;
      }),
      0,
    );
    return { wch: Math.max(headerLen, maxDataLen) + 2 };
  });
  worksheet["!cols"] = colWidths;

  Object.keys(worksheet).forEach(addr => {
    if (addr[0] === "!") return;
    worksheet[addr].s = {
      alignment: {
        horizontal: "left",
        vertical: "top",
      },
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, worksheet, "Sheet1");
  XLSX.writeFile(wb, fileName + ".xlsx", { bookType: "xlsx", cellStyles: true });
}

export const constructName = (firstName, middleName, lastName) => {
  return `${firstName || ""} ${middleName || ""} ${lastName || ""}`.trim();
};
