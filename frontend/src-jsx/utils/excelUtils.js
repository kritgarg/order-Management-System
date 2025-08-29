import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = (orders) => {
  const ws = XLSX.utils.json_to_sheet(orders);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(data, "rolling_mill_orders.xlsx");
};

export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const orders = XLSX.utils.sheet_to_json(worksheet);
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const downloadSampleExcel = () => {
  const sampleData = [
    {
      orderNumber: "RM001",
      companyName: "ABC Steel Works",
      contactPerson: "John Doe",
      phone: "+1234567890",
      email: "john@abcsteel.com",
      rollDimension: "50x100x200",
      rollType: "Work Roll",
      quantity: 5,
      pricePerUnit: 15000,
      totalPrice: 75000,
      status: "pending",
      orderDate: "2024-01-15",
      expectedDelivery: "2024-02-15",
      notes: "Urgent order",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sample Orders");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(data, "sample_orders.xlsx");
};
