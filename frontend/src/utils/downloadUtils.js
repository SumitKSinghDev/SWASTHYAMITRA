// Utility functions for downloading files

export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadCSV = (data, filename) => {
  const csvContent = convertToCSV(data);
  downloadFile(csvContent, filename, 'text/csv');
};

export const downloadJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

export const downloadPDF = (content, filename) => {
  // For PDF generation, you would typically use a library like jsPDF
  // This is a placeholder that creates a text file
  downloadFile(content, filename, 'application/pdf');
};

export const downloadPrescription = (prescription) => {
  const content = `
PRESCRIPTION
============

Prescription ID: ${prescription.prescriptionId}
Patient: ${prescription.patientName}
Doctor: ${prescription.doctorName}
Date: ${prescription.date}
Diagnosis: ${prescription.diagnosis}

Medications:
${prescription.medications.map(med => 
  `- ${med.name} (${med.dosage}) - ${med.frequency} for ${med.duration}`
).join('\n')}

Notes: ${prescription.notes || 'None'}
Follow-up: ${prescription.followUpDate || 'Not scheduled'}

Generated on: ${new Date().toLocaleString()}
  `.trim();
  
  downloadFile(content, `prescription_${prescription.prescriptionId}.txt`, 'text/plain');
};

export const downloadReport = (reportData, reportType) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${reportType}_report_${timestamp}`;
  
  if (reportType === 'csv') {
    downloadCSV(reportData, `${filename}.csv`);
  } else {
    downloadJSON(reportData, `${filename}.json`);
  }
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

export const printDocument = (content, title = 'Document') => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        <div class="content">${content}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
