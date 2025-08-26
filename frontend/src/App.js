import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Komponensek
const SearchBar = ({ onSearch, searchTerm, setSearchTerm }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Keresés alkatrész név, kód, típus vagy beszállító szerint..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={onSearch}
          className="absolute right-2 top-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          🔍 Keresés
        </button>
      </div>
    </div>
  );
};

const PartForm = ({ partTypes, suppliers, onSubmit, onCancel, editingPart }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    part_type_id: "",
    supplier_id: ""
  });

  useEffect(() => {
    if (editingPart) {
      setFormData({
        name: editingPart.name,
        code: editingPart.code,
        part_type_id: editingPart.part_type_id || "",
        supplier_id: editingPart.supplier_id || ""
      });
    }
  }, [editingPart]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.part_type_id || !formData.supplier_id) {
      alert("Minden mező kitöltése kötelező!");
      return;
    }
    onSubmit(formData);
    setFormData({ name: "", code: "", part_type_id: "", supplier_id: "" });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {editingPart ? "Alkatrész szerkesztése" : "Új alkatrész hozzáadása"}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alkatrész neve *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="pl. Turbo CHRA..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kód *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="pl. CHR001..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alkatrésztípus *
          </label>
          <select
            value={formData.part_type_id}
            onChange={(e) => setFormData({...formData, part_type_id: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Válassz típust...</option>
            {partTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beszállító *
          </label>
          <select
            value={formData.supplier_id}
            onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Válassz beszállítót...</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
          >
            ✅ {editingPart ? "Frissítés" : "Hozzáadás"}
          </button>
          {editingPart && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Mégsem
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const PartsTable = ({ parts, onStockMovement, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Név
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kód
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Típus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beszállító
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Készlet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Műveletek
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {part.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.part_type_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.supplier_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`font-bold ${part.stock_quantity <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {part.stock_quantity} db
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onStockMovement(part.id, 'IN')}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                  >
                    📥 IN
                  </button>
                  <button
                    onClick={() => onStockMovement(part.id, 'OUT')}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                  >
                    📤 OUT
                  </button>
                  <button
                    onClick={() => onEdit(part)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(part.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {parts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nincs találat
        </div>
      )}
    </div>
  );
};

const StockMovementModal = ({ partId, partName, movementType, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert("A mennyiségnek pozitív számnak kell lennie!");
      return;
    }
    onSubmit(partId, movementType, quantity);
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Készletmozgás - {movementType === 'IN' ? 'Beraktározás' : 'Kiadás'}
        </h3>
        <p className="text-gray-600 mb-4">
          <strong>Alkatrész:</strong> {partName}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mennyiség (db)
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 text-white px-4 py-2 rounded hover:opacity-90 ${
                movementType === 'IN' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {movementType === 'IN' ? '📥 Beraktározás' : '📤 Kiadás'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Mégsem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManagementTabs = ({ partTypes, suppliers, onUpdatePartTypes, onUpdateSuppliers }) => {
  const [activeTab, setActiveTab] = useState('types');
  const [newTypeName, setNewTypeName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [editingType, setEditingType] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const handleAddType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    
    try {
      await axios.post(`${API}/part-types`, { name: newTypeName });
      setNewTypeName('');
      onUpdatePartTypes();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült hozzáadni'));
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    
    try {
      await axios.post(`${API}/suppliers`, { name: newSupplierName });
      setNewSupplierName('');
      onUpdateSuppliers();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült hozzáadni'));
    }
  };

  const handleUpdateType = async (id, name) => {
    try {
      await axios.put(`${API}/part-types/${id}`, { name });
      setEditingType(null);
      onUpdatePartTypes();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült frissíteni'));
    }
  };

  const handleUpdateSupplier = async (id, name) => {
    try {
      await axios.put(`${API}/suppliers/${id}`, { name });
      setEditingSupplier(null);
      onUpdateSuppliers();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült frissíteni'));
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt az alkatrésztípust?')) return;
    
    try {
      await axios.delete(`${API}/part-types/${id}`);
      onUpdatePartTypes();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült törölni'));
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a beszállítót?')) return;
    
    try {
      await axios.delete(`${API}/suppliers/${id}`);
      onUpdateSuppliers();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült törölni'));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 mr-2 ${activeTab === 'types' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Alkatrésztípusok kezelése
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 ${activeTab === 'suppliers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Beszállítók kezelése
        </button>
      </div>

      {activeTab === 'types' && (
        <div>
          <form onSubmit={handleAddType} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Új alkatrésztípus neve..."
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Hozzáadás
            </button>
          </form>
          
          <div className="space-y-2">
            {partTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                {editingType === type.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      defaultValue={type.name}
                      className="flex-1 p-1 border border-gray-300 rounded"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateType(type.id, e.target.value);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.parentElement.querySelector('input');
                        handleUpdateType(type.id, input.value);
                      }}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => setEditingType(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                    >
                      ❌
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{type.name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditingType(type.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteType(type.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div>
          <form onSubmit={handleAddSupplier} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              placeholder="Új beszállító neve..."
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Hozzáadás
            </button>
          </form>
          
          <div className="space-y-2">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                {editingSupplier === supplier.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      defaultValue={supplier.name}
                      className="flex-1 p-1 border border-gray-300 rounded"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateSupplier(supplier.id, e.target.value);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.parentElement.querySelector('input');
                        handleUpdateSupplier(supplier.id, input.value);
                      }}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => setEditingSupplier(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                    >
                      ❌
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{supplier.name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditingSupplier(supplier.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Fő App komponens
function App() {
  const [parts, setParts] = useState([]);
  const [partTypes, setPartTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stockModal, setStockModal] = useState(null);
  const [editingPart, setEditingPart] = useState(null);

  // Adatok betöltése
  const loadParts = async (search = '') => {
    try {
      const response = await axios.get(`${API}/parts${search ? `?search=${search}` : ''}`);
      setParts(response.data);
    } catch (error) {
      console.error('Hiba az alkatrészek betöltésekor:', error);
    }
  };

  const loadPartTypes = async () => {
    try {
      const response = await axios.get(`${API}/part-types`);
      setPartTypes(response.data);
    } catch (error) {
      console.error('Hiba az alkatrésztípusok betöltésekor:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Hiba a beszállítók betöltésekor:', error);
    }
  };

  const initializeData = async () => {
    try {
      await axios.post(`${API}/initialize-data`);
      await loadPartTypes();
      await loadSuppliers();
    } catch (error) {
      console.error('Hiba az adatok inicializálásakor:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await initializeData();
      await loadParts();
      setLoading(false);
    };
    initialize();
  }, []);

  // Keresés
  const handleSearch = () => {
    loadParts(searchTerm);
  };

  // Alkatrész hozzáadása/szerkesztése
  const handlePartSubmit = async (formData) => {
    try {
      if (editingPart) {
        await axios.put(`${API}/parts/${editingPart.id}`, formData);
        setEditingPart(null);
      } else {
        await axios.post(`${API}/parts`, formData);
      }
      await loadParts(searchTerm);
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült menteni'));
    }
  };

  // Alkatrész törlése
  const handlePartDelete = async (partId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt az alkatrészt?')) return;
    
    try {
      await axios.delete(`${API}/parts/${partId}`);
      await loadParts(searchTerm);
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült törölni'));
    }
  };

  // Készletmozgás
  const handleStockMovement = (partId, movementType) => {
    const part = parts.find(p => p.id === partId);
    setStockModal({ partId, partName: part.name, movementType });
  };

  const handleStockMovementSubmit = async (partId, movementType, quantity) => {
    try {
      await axios.post(`${API}/stock-movements`, {
        part_id: partId,
        movement_type: movementType,
        quantity: quantity
      });
      setStockModal(null);
      await loadParts(searchTerm);
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült végrehajtani a készletmozgást'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔧 Turbófeltöltő Adatbázis
          </h1>
          <p className="text-gray-600">
            Alkatrészek és raktárkészlet kezelése
          </p>
        </header>

        <ManagementTabs
          partTypes={partTypes}
          suppliers={suppliers}
          onUpdatePartTypes={loadPartTypes}
          onUpdateSuppliers={loadSuppliers}
        />

        <PartForm
          partTypes={partTypes}
          suppliers={suppliers}
          onSubmit={handlePartSubmit}
          onCancel={() => setEditingPart(null)}
          editingPart={editingPart}
        />

        <SearchBar
          onSearch={handleSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="mb-4 text-sm text-gray-600">
          Összesen: {parts.length} alkatrész
        </div>

        <PartsTable
          parts={parts}
          onStockMovement={handleStockMovement}
          onEdit={setEditingPart}
          onDelete={handlePartDelete}
        />

        {stockModal && (
          <StockMovementModal
            partId={stockModal.partId}
            partName={stockModal.partName}
            movementType={stockModal.movementType}
            onClose={() => setStockModal(null)}
            onSubmit={handleStockMovementSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default App;