import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const AIFaqPage = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const recognitionRef = useRef(null);
  const exportDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close dropdown when pressing Escape
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsExportDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Audio input handler
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    setError('');
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setListening(false);
    };
    recognition.onerror = (event) => {
      setError('Audio error: ' + event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnswer('');
    setUsageData(null);
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswer(data.answer);
        setUsageData(data.usageData || null);
      } else {
        setError(data.error || 'Error fetching answer.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    if (!usageData || usageData.length === 0) {
      alert('No data available to export');
      return;
    }

    // Prepare data for Excel
    const excelData = usageData.map((data, index) => ({
      'S.No': index + 1,
      'Used By': data.usedBy,
      'Roll No': data.userRollNo,
      'Quantity': data.quantity,
      'Approved By': data.approvedBy,
      'Approver Role': data.approverRole,
      'Date & Time': data.issueDate,
      'Status': data.status,
      'Purpose': data.purpose
    }));

    // Add summary data
    const totalQuantity = usageData.reduce((sum, data) => {
      const quantity = parseFloat(data.quantity.replace('g', '')) || parseFloat(data.quantity) || 0;
      return sum + quantity;
    }, 0);
    
    const issuedCount = usageData.filter(data => data.status === 'issued').length;
    const returnedCount = usageData.filter(data => data.status === 'returned').length;

    const summaryData = [
      { 'Metric': 'Total Usage Records', 'Value': usageData.length },
      { 'Metric': 'Total Quantity Used', 'Value': `${totalQuantity} ${usageData[0]?.itemType === 'Chemical' ? 'g' : 'units'}` },
      { 'Metric': 'Issued Items', 'Value': issuedCount },
      { 'Metric': 'Returned Items', 'Value': returnedCount },
      { 'Metric': 'Average per Usage', 'Value': `${(totalQuantity / usageData.length).toFixed(2)} ${usageData[0]?.itemType === 'Chemical' ? 'g' : 'units'}` }
    ];

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Add detailed data sheet
    const ws1 = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Usage Details');
    
    // Add summary sheet
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

    // Save the file
    const fileName = `${usageData[0]?.itemName}_usage_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!usageData || usageData.length === 0) {
      alert('No data available to export');
      return;
    }

    // Prepare CSV data
    const headers = ['S.No', 'Used By', 'Roll No', 'Quantity', 'Approved By', 'Approver Role', 'Date & Time', 'Status', 'Purpose'];
    const csvData = usageData.map((data, index) => [
      index + 1,
      data.usedBy,
      data.userRollNo,
      data.quantity,
      data.approvedBy,
      data.approverRole,
      data.issueDate,
      data.status,
      data.purpose
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${usageData[0]?.itemName}_usage_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Download Function
  const downloadPDF = () => {
    if (!usageData || usageData.length === 0) {
      alert('No data available to download');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Item Usage Report', 105, 20, { align: 'center' });
    
    // Add subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Item: ${usageData[0]?.itemName} (${usageData[0]?.itemType})`, 105, 30, { align: 'center' });
    
    // Add generation info
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);
    doc.text(`Total Records: ${usageData.length}`, 20, 45);
    doc.text(`Query: ${question}`, 20, 50);
    
    // Calculate summary statistics
    const totalQuantity = usageData.reduce((sum, data) => {
      const quantity = parseFloat(data.quantity.replace('g', '')) || parseFloat(data.quantity) || 0;
      return sum + quantity;
    }, 0);
    
    const issuedCount = usageData.filter(data => data.status === 'issued').length;
    const returnedCount = usageData.filter(data => data.status === 'returned').length;
    
    // Add summary box
    doc.setFillColor(240, 248, 255);
    doc.rect(20, 55, 170, 25, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 25, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Total usage records: ${usageData.length}`, 30, 68);
    doc.text(`• Total quantity used: ${totalQuantity} ${usageData[0]?.itemType === 'Chemical' ? 'g' : 'units'}`, 30, 73);
    doc.text(`• Issued items: ${issuedCount} | Returned items: ${returnedCount}`, 30, 78);
    
    // Prepare table data
    const tableData = usageData.map((data, index) => [
      index + 1,
      data.usedBy,
      data.userRollNo,
      data.quantity,
      data.approvedBy,
      data.approverRole,
      data.issueDate,
      data.status,
      data.purpose
    ]);

    // Add table
    doc.autoTable({
      startY: 85,
      head: [
        ['#', 'Used By', 'Roll No', 'Quantity', 'Approved By', 'Approver Role', 'Date & Time', 'Status', 'Purpose']
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 10 }, // #
        1: { cellWidth: 25 }, // Used By
        2: { cellWidth: 20 }, // Roll No
        3: { cellWidth: 20 }, // Quantity
        4: { cellWidth: 25 }, // Approved By
        5: { cellWidth: 20 }, // Approver Role
        6: { cellWidth: 30 }, // Date & Time
        7: { cellWidth: 15 }, // Status
        8: { cellWidth: 35 }  // Purpose
      },
      didDrawPage: function (data) {
        // Add page number
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Add detailed summary at the end
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Summary:', 20, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Item type: ${usageData[0]?.itemType}`, 25, finalY + 8);
    doc.text(`• Item name: ${usageData[0]?.itemName}`, 25, finalY + 13);
    doc.text(`• Average quantity per usage: ${(totalQuantity / usageData.length).toFixed(2)} ${usageData[0]?.itemType === 'Chemical' ? 'ml' : 'units'}`, 25, finalY + 18);
    
    // Add usage frequency by user
    const userUsage = {};
    usageData.forEach(data => {
      if (userUsage[data.usedBy]) {
        userUsage[data.usedBy]++;
      } else {
        userUsage[data.usedBy] = 1;
      }
    });
    
    const topUsers = Object.entries(userUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (topUsers.length > 0) {
      doc.text(`• Top users: ${topUsers.map(([user, count]) => `${user} (${count}x)`).join(', ')}`, 25, finalY + 23);
    }

    // Save the PDF
    const fileName = `${usageData[0]?.itemName}_usage_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Download Summary Report
  const downloadSummaryPDF = () => {
    if (!usageData || usageData.length === 0) {
      alert('No data available to download');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Item Usage Summary Report', 105, 20, { align: 'center' });
    
    // Add subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${usageData[0]?.itemName} (${usageData[0]?.itemType})`, 105, 30, { align: 'center' });
    
    // Add generation info
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);
    doc.text(`Query: ${question}`, 20, 45);
    
    // Calculate statistics
    const totalQuantity = usageData.reduce((sum, data) => {
      const quantity = parseFloat(data.quantity.replace('g', '')) || parseFloat(data.quantity) || 0;
      return sum + quantity;
    }, 0);
    
    const issuedCount = usageData.filter(data => data.status === 'issued').length;
    const returnedCount = usageData.filter(data => data.status === 'returned').length;
    
    // Add statistics table
    doc.autoTable({
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Total Usage Records', usageData.length.toString()],
        ['Total Quantity Used', `${totalQuantity} ${usageData[0]?.itemType === 'Chemical' ? 'g' : 'units'}`],
        ['Issued Items', issuedCount.toString()],
        ['Returned Items', returnedCount.toString()],
        ['Average per Usage', `${(totalQuantity / usageData.length).toFixed(2)} ${usageData[0]?.itemType === 'Chemical' ? 'g' : 'units'}`]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    // Save the PDF
    const fileName = `${usageData[0]?.itemName}_summary_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="w-full max-w-6xl max-h-[80vh] p-6 bg-white rounded shadow relative overflow-y-auto">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        onClick={onClose}
        aria-label="Close FAQ"
        type="button"
      >
        ×
      </button>
      <h2 className="text-2xl font-bold mb-4">AI FAQ - Item Usage Query</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Ask about item usage (e.g., Who used NaCl? How much HCl was used?)"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={handleMicClick}
            className={`px-3 py-2 rounded ${listening ? 'bg-red-500' : 'bg-gray-300'} text-white`}
            title={listening ? 'Stop listening' : 'Speak your question'}
          >
            <span role="img" aria-label="mic">🎤</span>
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Usage Data'}
        </button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      
      {usageData && usageData.length > 0 && (
        <div className="bg-gray-50 p-4 rounded border">
          <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                📊 Usage Data for: <span className="text-blue-600">{usageData[0]?.itemName}</span> ({usageData[0]?.itemType})
              </h3>
              <p className="text-sm text-gray-600">Total usage records: {usageData.length}</p>
            </div>
            <div className="flex gap-2">
              <div className="relative" ref={exportDropdownRef}>
                <button 
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base transition-colors duration-200"
                  aria-expanded={isExportDropdownOpen}
                  aria-haspopup="true"
                >
                  <span role="img" aria-label="export">📤</span>
                  <span className="hidden sm:inline">Export</span>
                  <svg 
                    className={`w-4 h-4 ml-1 transition-transform duration-200 ${isExportDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200 transform opacity-100 scale-100 transition-all duration-200 origin-top-right">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          downloadSummaryPDF();
                          setIsExportDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                      >
                        <span role="img" aria-label="summary">📋</span>
                        Summary PDF
                      </button>
                      <button
                        onClick={() => {
                          downloadPDF();
                          setIsExportDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                      >
                        <span role="img" aria-label="detailed">📄</span>
                        Detailed PDF
                      </button>
                      <button
                        onClick={() => {
                          exportToExcel();
                          setIsExportDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                      >
                        <span role="img" aria-label="excel">📊</span>
                        Excel (.xlsx)
                      </button>
                      <button
                        onClick={() => {
                          exportToCSV();
                          setIsExportDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                      >
                        <span role="img" aria-label="csv">📄</span>
                        CSV (.csv)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm bg-white">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Used By</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Roll No</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Quantity</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Approved By</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Approver Role</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Date & Time</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {usageData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 font-medium text-gray-800">
                      {data.usedBy}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-600">
                      {data.userRollNo}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-blue-600">
                      {data.quantity}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-700">
                      {data.approvedBy}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-600 capitalize">
                      {data.approverRole}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-700">
                      {data.issueDate}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        data.status === 'issued' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {data.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-600 text-xs">
                      {data.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {answer && !usageData && (
        <div className="bg-gray-100 p-4 rounded">
          <strong>Answer:</strong>
          <div className="mt-2 text-gray-700">{answer}</div>
        </div>
      )}
    </div>
  );
};

export default AIFaqPage; 