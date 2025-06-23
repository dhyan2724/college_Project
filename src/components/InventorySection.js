import React, { useState } from "react";
import * as XLSX from "xlsx";
import api from '../services/api';

const categories = [
  { key: "chemicals", label: "Chemicals" },
  { key: "glasswares", label: "Glasswares" },
  { key: "plasticwares", label: "Plasticwares" },
  { key: "instruments", label: "Instruments" },
];

const InventorySection = ({ chemicals, glasswares, plasticwares, instruments }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Combine all categories for "all" view
  const getAllInventory = () => {
    let all = [];
    categories.forEach(cat => {
      const items = (cat.key === "chemicals" ? chemicals :
                    cat.key === "glasswares" ? glasswares :
                    cat.key === "plasticwares" ? plasticwares :
                    cat.key === "instruments" ? instruments : []);
      if (items && items.length > 0) {
        all = all.concat(
          items.map(item => ({
            ...item,
            category: cat.label,
          }))
        );
      }
    });
    return all;
  };

  const getCurrentInventory = () => {
    if (selectedCategory === "all") return getAllInventory();
    let items = [];
    if (selectedCategory === "chemicals") items = chemicals;
    if (selectedCategory === "glasswares") items = glasswares;
    if (selectedCategory === "plasticwares") items = plasticwares;
    if (selectedCategory === "instruments") items = instruments;
    return (items || []).map(item => ({
      ...item,
      category: categories.find(c => c.key === selectedCategory).label,
    }));
  };

  // Download helpers
  const downloadExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, filename);
  };

  // Columns to display for each category
  const columnsByCategory = {
    chemicals: [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'storagePlace', label: 'Storage Place' },
      { key: 'totalWeight', label: 'Total Weight (g)' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    glasswares: [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'storagePlace', label: 'Storage Place' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    plasticwares: [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'storagePlace', label: 'Storage Place' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    instruments: [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'storagePlace', label: 'Storage Place' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    all: [
      { key: 'category', label: 'Category' },
      { key: 'name', label: 'Name' },
      { key: 'actions', label: 'Actions' },
    ],
  };

  const handleDelete = async (category, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (category === 'chemicals') await api.deleteChemical(id);
      if (category === 'glasswares') await api.deleteGlassware(id);
      if (category === 'plasticwares') await api.deletePlasticware(id);
      if (category === 'instruments') await api.deleteInstrument(id);
      window.location.reload();
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Inventory</h2>
        <div>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
            onClick={() => downloadExcel(getAllInventory(), "all_inventory.xlsx")}
          >
            Download All as Excel
          </button>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded"
            onClick={() =>
              downloadExcel(getCurrentInventory(), `${selectedCategory}_inventory.xlsx`)
            }
          >
            Download Current as Excel
          </button>
        </div>
      </div>
      <div className="mb-4">
        <button
          className={`px-3 py-1 rounded mr-2 ${selectedCategory === "all" ? "bg-gray-800 text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`px-3 py-1 rounded mr-2 ${selectedCategory === cat.key ? "bg-gray-800 text-white" : "bg-gray-200"}`}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              {columnsByCategory[selectedCategory].map(col => (
                <th key={col.key} className="border px-2 py-1">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getCurrentInventory().map((item, idx) => (
              <tr key={item._id || idx}>
                {columnsByCategory[selectedCategory].map(col => (
                  col.key === 'actions' ? (
                    <td key={col.key} className="border px-2 py-1">
                      <button className="text-red-600 mr-2" onClick={() => handleDelete(selectedCategory, item._id)}>Delete</button>
                      {/* Add edit button/modal here if needed */}
                    </td>
                  ) : (
                    <td key={col.key} className="border px-2 py-1">{item[col.key] || ''}</td>
                  )
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventorySection; 