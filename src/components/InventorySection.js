import React, { useState } from "react";
import * as XLSX from "xlsx";
import api from '../services/api';

const categories = [
  { key: "chemicals", label: "Chemicals" },
  { key: "glasswares", label: "Glasswares" },
  { key: "plasticwares", label: "Plasticwares" },
  { key: "instruments", label: "Instruments" },
  { key: "miscellaneous", label: "Miscellaneous" },
  { key: "specimens", label: "Specimens" },
  { key: "slides", label: "Slides" },
];

const InventorySection = ({ chemicals, glasswares, plasticwares, instruments, miscellaneous, specimens = [], slides = [], minorinstruments = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editItem, setEditItem] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // <-- Add search state

  // Combine all categories for "all" view
  const getAllInventory = () => {
    let all = [];
    categories.forEach(cat => {
      const items = (cat.key === "chemicals" ? chemicals :
                    cat.key === "glasswares" ? glasswares :
                    cat.key === "plasticwares" ? plasticwares :
                    cat.key === "instruments" ? instruments :
                    cat.key === "miscellaneous" ? miscellaneous :
                    cat.key === "specimens" ? specimens :
                    cat.key === "slides" ? slides :
                    cat.key === "minorinstruments" ? minorinstruments : []);
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
    if (selectedCategory === "chemicals") items = chemicals || [];
    if (selectedCategory === "glasswares") items = glasswares || [];
    if (selectedCategory === "plasticwares") items = plasticwares || [];
    if (selectedCategory === "instruments") items = instruments || [];
    if (selectedCategory === "miscellaneous") items = miscellaneous || [];
    if (selectedCategory === "specimens") items = specimens || [];
    if (selectedCategory === "slides") items = slides || [];
    if (selectedCategory === "minorinstruments") items = minorinstruments || [];
    return items.map(item => ({
      ...item,
      category: categories.find(c => c.key === selectedCategory)?.label || 'Unknown',
    }));
  };

  // Filtered inventory based on search query
  const getFilteredInventory = () => {
    const inventory = getCurrentInventory();
    if (!inventory || !Array.isArray(inventory)) return [];
    if (!searchQuery.trim()) return inventory;
    const query = searchQuery.toLowerCase();
    return inventory.filter(item =>
      (item && item.name && item.name.toLowerCase().includes(query)) ||
      (item && item.catalogNumber && item.catalogNumber.toLowerCase().includes(query)) ||
      (item && item.type && item.type.toLowerCase().includes(query)) ||
      (item && item.company && item.company.toLowerCase().includes(query))
    );
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
      { key: 'catalogNumber', label: 'Catalog Number' },
      { key: 'type', label: 'Type' },
      { key: 'storagePlace', label: 'Location' },
      { key: 'totalWeight', label: 'Total Weight (g)' },
      { key: 'availableWeight', label: 'Available Weight (g)' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    glasswares: [
      { key: 'name', label: 'Name' },
      { key: 'catalogNumber', label: 'Catalog Number' },
      { key: 'storagePlace', label: 'Location' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'availableQuantity', label: 'Available Quantity' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    plasticwares: [
      { key: 'name', label: 'Name' },
      { key: 'catalogNumber', label: 'Catalog Number' },
      { key: 'storagePlace', label: 'Location' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'availableQuantity', label: 'Available Quantity' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    instruments: [
      { key: 'name', label: 'Name' },
      { key: 'catalogNumber', label: 'Catalog Number' },
      { key: 'storagePlace', label: 'Location' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'availableQuantity', label: 'Available Quantity' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' }
    ],

    miscellaneous: [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'catalogNumber', label: 'Catalog Number' },
      { key: 'storagePlace', label: 'Location' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'availableQuantity', label: 'Available Quantity' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    slides: [
      { key: 'name', label: 'Name' },
      { key: 'catalogNumber', label: 'Catalog Number' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'storagePlace', label: 'Location' },
      { key: 'availableQuantity', label: 'Available Quantity' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    specimens: [
      { key: 'name', label: 'Name' },
      { key: 'catalogNumber', label: 'Catalog Number' },
      { key: 'storagePlace', label: 'Location' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'availableQuantity', label: 'Available Quantity' },
      { key: 'company', label: 'Company' },
      { key: 'actions', label: 'Actions' },
    ],
    all: [
      { key: 'category', label: 'Category' },
      { key: 'name', label: 'Name' },
      { key: 'catalogNumber', label: 'Catalog Number' },
      { key: 'actions', label: 'Actions' },
    ],
  };

  const handleDelete = async (category, id, item) => {
    console.log('Delete clicked:', { category, id, item });
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    // Determine the actual category if we're in "all" view
    let actualCategory = category;
    if (category === 'all') {
      // Determine category based on item properties
      if (item.totalWeight !== undefined) {
        actualCategory = 'chemicals';
      } else if (item.totalQuantity !== undefined) {
        // Check which collection this item belongs to by looking at the original arrays
        if (chemicals && chemicals.find(c => c.id === id)) {
          actualCategory = 'chemicals';
        } else if (glasswares && glasswares.find(g => g.id === id)) {
          actualCategory = 'glasswares';
        } else if (plasticwares && plasticwares.find(p => p.id === id)) {
          actualCategory = 'plasticwares';
        } else if (instruments && instruments.find(i => i.id === id)) {
          actualCategory = 'instruments';
        } else if (miscellaneous && miscellaneous.find(m => m.id === id)) {
          actualCategory = 'miscellaneous';
        } else if (specimens && specimens.find(s => s.id === id)) {
          actualCategory = 'specimens';
        } else if (slides && slides.find(s => s.id === id)) {
          actualCategory = 'slides';
        } 
      }
    }
    
    console.log('Actual category determined:', actualCategory);
    
    try {
      if (actualCategory === 'chemicals') await api.deleteChemical(id);
      if (actualCategory === 'glasswares') await api.deleteGlassware(id);
      if (actualCategory === 'plasticwares') await api.deletePlasticware(id);
      if (actualCategory === 'instruments') await api.deleteInstrument(id);
      if (actualCategory === 'miscellaneous') await api.deleteMiscellaneous(id);
      if (actualCategory === 'specimens') await api.deleteSpecimen(id);
      if (actualCategory === 'slides') await api.deleteSlide(id);
      console.log('Delete successful, reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed: ' + error.message);
    }
  };

  const handleEdit = (item, category) => {
    setEditItem({ ...item });
    setEditCategory(category);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      if (editCategory === 'chemicals') await api.updateChemical(editItem.id, editItem);
      if (editCategory === 'glasswares') await api.updateGlassware(editItem.id, editItem);
      if (editCategory === 'plasticwares') await api.updatePlasticware(editItem.id, editItem);
      if (editCategory === 'instruments') await api.updateInstrument(editItem.id, editItem);
      if (editCategory === 'miscellaneous') await api.updateMiscellaneous(editItem.id, editItem);
      if (editCategory === 'specimens') await api.updateSpecimen(editItem.id, editItem);
      if (editCategory === 'slides') await api.updateSlide(editItem.id, editItem);
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      alert('Edit failed: ' + error.message);
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
      {/* Search Bar */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          className="border p-2 rounded w-full max-w-xs"
          placeholder="Search by name, type, or company..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
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
            {getFilteredInventory().map((item, idx) => (
              <tr key={item.id || idx}>
                {columnsByCategory[selectedCategory].map(col => (
                  col.key === 'actions' ? (
                    <td key={col.key} className="border px-2 py-1">
                      <button className="text-red-600 mr-2" onClick={() => handleDelete(selectedCategory, item.id, item)}>Delete</button>
                      <button className="text-blue-600" onClick={() => handleEdit(item, selectedCategory)}>Edit</button>
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
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Item</h2>
            <form onSubmit={e => { e.preventDefault(); handleEditSubmit(); }}>
              <input
                className="border p-2 mb-2 w-full"
                value={editItem.name || ''}
                onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                placeholder="Name"
                required
              />
              <input
                className="border p-2 mb-2 w-full"
                value={editItem.catalogNumber || ''}
                onChange={e => setEditItem({ ...editItem, catalogNumber: e.target.value })}
                placeholder="Catalog Number"
                required
              />
              <input
                className="border p-2 mb-2 w-full"
                value={editItem.type || ''}
                onChange={e => setEditItem({ ...editItem, type: e.target.value })}
                placeholder="Type"
                required={editCategory === 'chemicals' || editCategory === 'glasswares' || editCategory === 'plasticwares' || editCategory === 'instruments'}
              />
              <input
                className="border p-2 mb-2 w-full"
                value={editItem.storagePlace || ''}
                onChange={e => setEditItem({ ...editItem, storagePlace: e.target.value })}
                placeholder="Storage Place"
                required
              />
              {/* Show totalWeight for chemicals, totalQuantity for others */}
              {editCategory === 'chemicals' ? (
                <input
                  className="border p-2 mb-2 w-full"
                  type="number"
                  value={editItem.totalWeight || ''}
                  onChange={e => setEditItem({ ...editItem, totalWeight: e.target.value })}
                  placeholder="Total Weight (g)"
                  required
                />
              ) : (
                <input
                  className="border p-2 mb-2 w-full"
                  type="number"
                  value={editItem.totalQuantity || ''}
                  onChange={e => setEditItem({ ...editItem, totalQuantity: e.target.value })}
                  placeholder="Total Quantity"
                  required
                />
              )}
              <input
                className="border p-2 mb-2 w-full"
                value={editItem.company || ''}
                onChange={e => setEditItem({ ...editItem, company: e.target.value })}
                placeholder="Company"
              />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventorySection;