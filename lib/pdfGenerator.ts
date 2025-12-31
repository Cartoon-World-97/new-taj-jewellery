import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface TransactionData {
  _id?: string;
  billNo: string;
  date: string;
  items: Array<{
    description: string;
    pcs: number;
    netWt: number;
    addWt: number;
    inchIbr: number;
    gold: number;
  }>;
  total: {
    pcs: number;
    netWt: number;
    inchIbr: number;
    gold: number;
  };
  goldBar: {
    weight: number;
    amount: number;
  };
  closingBalance: {
    gold: number;
    cash: number;
  };
  customerName?: string;
  customerPhone?: string;
  createdBy?: string;
}

export function generateTransactionPDF(transaction: TransactionData): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RAJU SEAKH', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ph # 7874900204', 105, 27, { align: 'center' });
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ROUGH ESTIMATE', 105, 40, { align: 'center' });
  
  // Bill Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bill No: ${transaction.billNo}`, 150, 50);
  doc.text(`Date: ${new Date(transaction.date).toLocaleDateString('en-IN')}`, 150, 57);
  
  if (transaction.customerName) {
    doc.text(`Customer: ${transaction.customerName}`, 20, 50);
    if (transaction.customerPhone) {
      doc.text(`Phone: ${transaction.customerPhone}`, 20, 57);
    }
  }
  
  // Items Table
  const tableData = transaction.items.map((item, index) => [
    index === 0 ? 'S' : '',
    item.description,
    item.pcs.toString(),
    item.netWt.toFixed(3),
    item.addWt ? item.addWt.toFixed(3) : '',
    item.inchIbr.toFixed(2),
    item.gold.toFixed(3)
  ]);
  
  // Add Total Row
  tableData.push([
    'Total',
    '',
    transaction.total.pcs.toString(),
    transaction.total.netWt.toFixed(3),
    '',
    transaction.total.inchIbr.toFixed(2),
    transaction.total.gold.toFixed(3)
  ]);
  
  // Add Gold Bar Row
  tableData.push([
    'MR',
    `GOLD BAR (${transaction.goldBar.weight.toFixed(2)})`,
    transaction.total.pcs.toString(),
    transaction.total.netWt.toFixed(3),
    `-${transaction.total.gold.toFixed(3)}`,
    transaction.goldBar.amount.toFixed(2),
    `-${transaction.total.gold.toFixed(3)}`
  ]);
  
  // Add Closing Balance Row
  tableData.push([
    'Cl. Balance',
    '',
    '',
    '',
    '',
    transaction.closingBalance.gold.toFixed(2),
    transaction.closingBalance.cash ? 'Nil' : 'Nil'
  ]);
  
  (doc as any).autoTable({
    startY: 65,
    head: [['', 'Description', 'Pc', 'Net Wt', 'Add Wt', 'Tnch×Ibr', 'Gold']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [200, 200, 200], textColor: 0 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 60 },
      2: { cellWidth: 15 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 }
    }
  });
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 105, finalY, { align: 'center' });
  
  return doc;
}

export function downloadTransactionPDF(transaction: TransactionData): void {
  const doc = generateTransactionPDF(transaction);
  doc.save(`transaction-${transaction.billNo}.pdf`);
}
