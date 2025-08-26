import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Application Configuration (ezt majd localStorage-ből töltjük)
const getAppConfig = () => {
  const savedConfig = localStorage.getItem('appConfig');
  return savedConfig ? JSON.parse(savedConfig) : {
    appName: "Turbófeltöltő Adatbázis",
    logoUrl: "",
    labels: {
      parts: "Alkatrészek",
      partTypes: "Alkatrésztípusok",
      suppliers: "Beszállítók", 
      stock: "Készlet",
      search: "Keresés",
      add: "Hozzáadás",
      edit: "Szerkesztés",
      delete: "Törlés",
      settings: "Beállítások",
      code: "Kód",
      type: "Típus",
      supplier: "Beszállító",
      notes: "Jegyzet",
      quantity: "Mennyiség",
      operations: "Műveletek",
      stockIn: "Beraktározás",
      stockOut: "Kiadás",
      newPart: "Új alkatrész hozzáadása",
      management: "kezelése",
      backToMain: "Vissza a főoldalra",
      cancel: "Mégsem",
      save: "Mentés"
    }
  };
};

const saveAppConfig = (config) => {
  localStorage.setItem('appConfig', JSON.stringify(config));
};

// Utility komponensek
const SearchBar = ({ onSearch, searchTerm, setSearchTerm, config }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder={`${config.labels.search} ${config.labels.parts.toLowerCase()} ${config.labels.code.toLowerCase()}, ${config.labels.type.toLowerCase()}, ${config.labels.supplier.toLowerCase()} vagy ${config.labels.notes.toLowerCase()} szerint...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
        <button
          onClick={onSearch}
          className="absolute right-2 top-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-medium"
        >
          🔍 {config.labels.search}
        </button>
      </div>
    </div>
  );
};

const PartsTable = ({ parts, onStockMovement, onEdit, onDelete, config }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {config.labels.code}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {config.labels.type}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {config.labels.supplier}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {config.labels.notes}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {config.labels.stock}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {config.labels.operations}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {part.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.part_type_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.supplier_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={part.notes || "-"}>
                  {part.notes || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`font-bold ${part.stock_quantity <= 0 ? 'text-red-600' : part.stock_quantity <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {part.stock_quantity} db
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onStockMovement(part.id, 'IN')}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs font-medium"
                  >
                    📥 IN
                  </button>
                  <button
                    onClick={() => onStockMovement(part.id, 'OUT')}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-medium"
                  >
                    📤 OUT
                  </button>
                  <button
                    onClick={() => onEdit(part)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs font-medium"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(part.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs font-medium"
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

const StockMovementModal = ({ partId, partName, partCode, movementType, onClose, onSubmit, config }) => {
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert(`A ${config.labels.quantity.toLowerCase()}nek pozitív számnak kell lennie!`);
      return;
    }
    onSubmit(partId, movementType, quantity);
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Készletmozgás - {movementType === 'IN' ? config.labels.stockIn : config.labels.stockOut}
        </h3>
        <p className="text-gray-600 mb-4">
          <strong>Alkatrész kód:</strong> {partCode}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.labels.quantity} (db)
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-lg"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 text-white px-4 py-3 rounded hover:opacity-90 font-medium ${
                movementType === 'IN' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {movementType === 'IN' ? `📥 ${config.labels.stockIn}` : `📤 ${config.labels.stockOut}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-3 rounded hover:bg-gray-600 font-medium"
            >
              {config.labels.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const QuickAddForm = ({ partTypes, suppliers, onSubmit, config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    part_type_id: "",
    supplier_id: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.part_type_id || !formData.supplier_id) {
      alert("Minden mező kitöltése kötelező!");
      return;
    }
    onSubmit(formData);
    setFormData({ name: "", code: "", part_type_id: "", supplier_id: "" });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium"
        >
          ➕ {config.labels.newPart}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">{config.labels.newPart}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {config.labels.name} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="pl. Turbo CHRA..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {config.labels.code} *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="pl. CHR001..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {config.labels.type} *
          </label>
          <select
            value={formData.part_type_id}
            onChange={(e) => setFormData({...formData, part_type_id: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Válassz típust...</option>
            {partTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {config.labels.supplier} *
          </label>
          <select
            value={formData.supplier_id}
            onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 font-medium"
          >
            ✅ {config.labels.add}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium"
          >
            {config.labels.cancel}
          </button>
        </div>
      </form>
    </div>
  );
};

// Főoldal komponens
const Dashboard = () => {
  const [parts, setParts] = useState([]);
  const [partTypes, setPartTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stockModal, setStockModal] = useState(null);
  const [editingPart, setEditingPart] = useState(null);
  const [config, setConfig] = useState(getAppConfig());

  // Listen for config changes
  useEffect(() => {
    const handleStorageChange = () => {
      setConfig(getAppConfig());
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also check for config changes periodically
    const interval = setInterval(() => {
      setConfig(getAppConfig());
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

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

  // Refresh config when returning from settings
  useEffect(() => {
    const refreshConfig = () => {
      const newConfig = getAppConfig();
      setConfig(newConfig);
    };
    
    // Listen for focus events (when user returns to tab)
    window.addEventListener('focus', refreshConfig);
    
    return () => {
      window.removeEventListener('focus', refreshConfig);
    };
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
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {config.logoUrl && (
              <img 
                src={config.logoUrl} 
                alt="Logo" 
                className="h-16 w-16 object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🔧 {config.appName}
              </h1>
              <p className="text-gray-600">
                {config.labels.parts} és raktárkészlet kezelése
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium flex items-center gap-2"
          >
            ⚙️ {config.labels.settings}
          </Link>
        </header>

        <QuickAddForm
          partTypes={partTypes}
          suppliers={suppliers}
          onSubmit={handlePartSubmit}
          config={config}
        />

        <SearchBar
          onSearch={handleSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          config={config}
        />

        <div className="mb-4 text-sm text-gray-600">
          Összesen: {parts.length} {config.labels.parts.toLowerCase()}
        </div>

        <PartsTable
          parts={parts}
          onStockMovement={handleStockMovement}
          onEdit={setEditingPart}
          onDelete={handlePartDelete}
          config={config}
        />

        {stockModal && (
          <StockMovementModal
            partId={stockModal.partId}
            partName={stockModal.partName}
            movementType={stockModal.movementType}
            onClose={() => setStockModal(null)}
            onSubmit={handleStockMovementSubmit}
            config={config}
          />
        )}
      </div>
    </div>
  );
};

// Beállítások oldal komponens
const Settings = () => {
  const [activeTab, setActiveTab] = useState('types');
  const [partTypes, setPartTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [editingType, setEditingType] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(getAppConfig());

  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280', 
    fontSize: 'medium',
    fontFamily: 'Inter'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await loadPartTypes();
    await loadSuppliers();
    setLoading(false);
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

  // Configuration save function
  const handleConfigSave = () => {
    saveAppConfig(config);
    alert('Beállítások mentve! Az oldal automatikusan frissül...');
    // Force immediate update and navigate back
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  // Logo upload handler
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.includes('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setConfig({
            ...config,
            logoUrl: e.target.result
          });
        };
        reader.readAsDataURL(file);
      } else {
        alert('Kérlek, csak kép fájlokat (PNG, JPG) válassz!');
      }
    }
  };

  // Part Types műveletek
  const handleAddType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    
    try {
      await axios.post(`${API}/part-types`, { name: newTypeName });
      setNewTypeName('');
      loadPartTypes();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült hozzáadni'));
    }
  };

  const handleUpdateType = async (id, name) => {
    try {
      await axios.put(`${API}/part-types/${id}`, { name });
      setEditingType(null);
      loadPartTypes();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült frissíteni'));
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt az alkatrésztípust?')) return;
    
    try {
      await axios.delete(`${API}/part-types/${id}`);
      loadPartTypes();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült törölni'));
    }
  };

  // Suppliers műveletek
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    
    try {
      await axios.post(`${API}/suppliers`, { name: newSupplierName });
      setNewSupplierName('');
      loadSuppliers();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült hozzáadni'));
    }
  };

  const handleUpdateSupplier = async (id, name) => {
    try {
      await axios.put(`${API}/suppliers/${id}`, { name });
      setEditingSupplier(null);
      loadSuppliers();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült frissíteni'));
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a beszállítót?')) return;
    
    try {
      await axios.delete(`${API}/suppliers/${id}`);
      loadSuppliers();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült törölni'));
    }
  };

  const handleDatabaseBackup = () => {
    alert('Adatbázis mentés funkció fejlesztés alatt...');
  };

  const handleDatabaseRestore = () => {
    alert('Adatbázis visszaállítás funkció fejlesztés alatt...');
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
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {config.logoUrl && (
              <img 
                src={config.logoUrl} 
                alt="Logo" 
                className="h-16 w-16 object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                ⚙️ {config.labels.settings}
              </h1>
              <p className="text-gray-600">
                Rendszer konfiguráció és karbantartás
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            🏠 {config.labels.backToMain}
          </Link>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('types')}
              className={`px-6 py-4 font-medium ${activeTab === 'types' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📦 {config.labels.partTypes} {config.labels.management}
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-6 py-4 font-medium ${activeTab === 'suppliers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🏢 {config.labels.suppliers} {config.labels.management}
            </button>
            <button
              onClick={() => setActiveTab('labels')}
              className={`px-6 py-4 font-medium ${activeTab === 'labels' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🏷️ Megnevezések
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-6 py-4 font-medium ${activeTab === 'branding' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🎨 Logo & Design
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-6 py-4 font-medium ${activeTab === 'database' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              💾 Adatbázis kezelés
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-6 py-4 font-medium ${activeTab === 'appearance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🎨 Megjelenés
            </button>
          </div>

          <div className="p-6">
            {/* Alkatrésztípusok Tab */}
            {activeTab === 'types' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{config.labels.partTypes} {config.labels.management}</h3>
                
                <form onSubmit={handleAddType} className="mb-6 flex gap-2">
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder={`Új ${config.labels.partTypes.toLowerCase()} neve...`}
                    className="flex-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 font-medium"
                  >
                    ➕ {config.labels.add}
                  </button>
                </form>
                
                <div className="space-y-2">
                  {partTypes.map(type => (
                    <div key={type.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      {editingType === type.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            defaultValue={type.name}
                            className="flex-1 p-2 border border-gray-300 rounded"
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
                            className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium"
                          >
                            ✅ {config.labels.save}
                          </button>
                          <button
                            onClick={() => setEditingType(null)}
                            className="bg-gray-500 text-white px-3 py-2 rounded text-sm font-medium"
                          >
                            ❌ {config.labels.cancel}
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{type.name}</span>
                          <div className="space-x-2">
                            <button
                              onClick={() => setEditingType(type.id)}
                              className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-600"
                            >
                              ✏️ {config.labels.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteType(type.id)}
                              className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600"
                            >
                              🗑️ {config.labels.delete}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Beszállítók Tab */}
            {activeTab === 'suppliers' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{config.labels.suppliers} {config.labels.management}</h3>
                
                <form onSubmit={handleAddSupplier} className="mb-6 flex gap-2">
                  <input
                    type="text"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder={`Új ${config.labels.supplier.toLowerCase()} neve...`}
                    className="flex-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 font-medium"
                  >
                    ➕ {config.labels.add}
                  </button>
                </form>
                
                <div className="space-y-2">
                  {suppliers.map(supplier => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      {editingSupplier === supplier.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            defaultValue={supplier.name}
                            className="flex-1 p-2 border border-gray-300 rounded"
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
                            className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium"
                          >
                            ✅ {config.labels.save}
                          </button>
                          <button
                            onClick={() => setEditingSupplier(null)}
                            className="bg-gray-500 text-white px-3 py-2 rounded text-sm font-medium"
                          >
                            ❌ {config.labels.cancel}
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{supplier.name}</span>
                          <div className="space-x-2">
                            <button
                              onClick={() => setEditingSupplier(supplier.id)}
                              className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-600"
                            >
                              ✏️ {config.labels.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600"
                            >
                              🗑️ {config.labels.delete}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Megnevezések Tab */}
            {activeTab === 'labels' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Megnevezések testreszabása</h3>
                <p className="text-gray-600 mb-6">Itt változtathatod meg az alkalmazás szöveges elemeit a saját igényeid szerint.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alkalmazás neve
                    </label>
                    <input
                      type="text"
                      value={config.appName}
                      onChange={(e) => setConfig({...config, appName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Alkatrész Kezelő"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      "Alkatrészek" elnevezés
                    </label>
                    <input
                      type="text"
                      value={config.labels.parts}
                      onChange={(e) => setConfig({...config, labels: {...config.labels, parts: e.target.value}})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Termékek, Cikkek, Elemek"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      "Alkatrésztípusok" elnevezés
                    </label>
                    <input
                      type="text"
                      value={config.labels.partTypes}
                      onChange={(e) => setConfig({...config, labels: {...config.labels, partTypes: e.target.value}})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Kategóriák, Típusok"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      "Beszállítók" elnevezés
                    </label>
                    <input
                      type="text"
                      value={config.labels.suppliers}
                      onChange={(e) => setConfig({...config, labels: {...config.labels, suppliers: e.target.value}})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Szállítók, Partnerek"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      "Készlet" elnevezés
                    </label>
                    <input
                      type="text"
                      value={config.labels.stock}
                      onChange={(e) => setConfig({...config, labels: {...config.labels, stock: e.target.value}})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Raktár, Darabszám"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      "Beraktározás" elnevezés
                    </label>
                    <input
                      type="text"
                      value={config.labels.stockIn}
                      onChange={(e) => setConfig({...config, labels: {...config.labels, stockIn: e.target.value}})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Beszerzés, Feltöltés"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      "Kiadás" elnevezés
                    </label>
                    <input
                      type="text"
                      value={config.labels.stockOut}
                      onChange={(e) => setConfig({...config, labels: {...config.labels, stockOut: e.target.value}})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Értékesítés, Kivétel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      "Keresés" gomb szövege
                    </label>
                    <input
                      type="text"
                      value={config.labels.search}
                      onChange={(e) => setConfig({...config, labels: {...config.labels, search: e.target.value}})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Keres, Talál"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleConfigSave}
                    className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 font-medium"
                  >
                    💾 Megnevezések mentése
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📝 Előnézet</h4>
                  <div className="space-y-2 text-blue-700">
                    <p><strong>App név:</strong> {config.appName}</p>
                    <p><strong>Főoldal leírás:</strong> {config.labels.parts} és raktárkészlet kezelése</p>
                    <p><strong>Gomb:</strong> ➕ {config.labels.newPart}</p>
                    <p><strong>Táblázat oszlopok:</strong> {config.labels.name}, {config.labels.code}, {config.labels.type}, {config.labels.supplier}, {config.labels.stock}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Logo & Design Tab */}
            {activeTab === 'branding' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Logo és Design</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">📷 Logo feltöltés</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {config.logoUrl ? (
                        <div>
                          <img 
                            src={config.logoUrl} 
                            alt="Current Logo" 
                            className="mx-auto h-32 w-32 object-contain mb-4 rounded-lg shadow-md"
                          />
                          <p className="text-sm text-gray-600 mb-4">Jelenlegi logo</p>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <div className="mx-auto h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-gray-400 text-4xl">🖼️</span>
                          </div>
                          <p className="text-sm text-gray-600">Nincs logo feltöltve</p>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 font-medium"
                      >
                        📁 Logo kiválasztása
                      </label>
                      
                      {config.logoUrl && (
                        <button
                          onClick={() => setConfig({...config, logoUrl: ''})}
                          className="ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-medium"
                        >
                          🗑️ Logo törlése
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <p><strong>Támogatott formátumok:</strong> PNG, JPG, JPEG</p>
                      <p><strong>Ajánlott méret:</strong> 64x64 pixel vagy négyzet alakú</p>
                      <p><strong>Megjelenés:</strong> Főoldal és beállítások oldal fejlécében</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">🎨 Design előnézet</h4>
                    <div className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center gap-3 mb-4">
                        {config.logoUrl && (
                          <img 
                            src={config.logoUrl} 
                            alt="Logo Preview" 
                            className="h-12 w-12 object-contain rounded shadow"
                          />
                        )}
                        <div>
                          <h5 className="text-xl font-bold text-gray-800">🔧 {config.appName}</h5>
                          <p className="text-gray-600 text-sm">{config.labels.parts} és raktárkészlet kezelése</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="bg-green-100 p-2 rounded">
                          <span className="text-green-800">➕ {config.labels.newPart}</span>
                        </div>
                        <div className="bg-blue-100 p-2 rounded">
                          <span className="text-blue-800">🔍 {config.labels.search}</span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded text-xs">
                          <span className="font-semibold">{config.labels.name}</span> | 
                          <span className="font-semibold"> {config.labels.code}</span> | 
                          <span className="font-semibold"> {config.labels.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleConfigSave}
                    className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 font-medium"
                  >
                    💾 Design beállítások mentése
                  </button>
                </div>
              </div>
            )}

            {/* Adatbázis kezelés Tab */}
            {activeTab === 'database' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Adatbázis kezelés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">💾 Adatbázis mentés</h4>
                    <p className="text-blue-600 mb-4">Teljes adatbázis biztonsági mentése</p>
                    <button
                      onClick={handleDatabaseBackup}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium"
                    >
                      Mentés indítása
                    </button>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">🔄 Adatbázis visszaállítás</h4>
                    <p className="text-orange-600 mb-4">Adatbázis visszaállítása mentésből</p>
                    <button
                      onClick={handleDatabaseRestore}
                      className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-medium"
                    >
                      Visszaállítás
                    </button>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">📊 Statisztikák</h4>
                    <p className="text-green-600 mb-2">{config.labels.partTypes} száma: {partTypes.length}</p>
                    <p className="text-green-600 mb-2">{config.labels.suppliers} száma: {suppliers.length}</p>
                    <p className="text-green-600 mb-4">Adatbázis állapot: ✅ Aktív</p>
                  </div>

                  <div className="bg-red-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">⚠️ Veszélyes műveletek</h4>
                    <p className="text-red-600 mb-4">Összes adat törlése (visszavonhatatlan!)</p>
                    <button
                      onClick={() => alert('Biztonsági okokból deaktiválva')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-medium"
                      disabled
                    >
                      Adatok törlése
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Megjelenés Tab */}
            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Megjelenés beállítások</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Elsődleges szín
                    </label>
                    <input
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) => setThemeSettings({...themeSettings, primaryColor: e.target.value})}
                      className="w-full h-12 border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Másodlagos szín
                    </label>
                    <input
                      type="color"
                      value={themeSettings.secondaryColor}
                      onChange={(e) => setThemeSettings({...themeSettings, secondaryColor: e.target.value})}
                      className="w-full h-12 border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Betűméret
                    </label>
                    <select
                      value={themeSettings.fontSize}
                      onChange={(e) => setThemeSettings({...themeSettings, fontSize: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">Kicsi</option>
                      <option value="medium">Közepes</option>
                      <option value="large">Nagy</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Betűtípus
                    </label>
                    <select
                      value={themeSettings.fontFamily}
                      onChange={(e) => setThemeSettings({...themeSettings, fontFamily: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => alert('Megjelenés beállítások mentve!')}
                    className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 font-medium"
                  >
                    Beállítások mentése
                  </button>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Előnézet</h4>
                  <div 
                    className="p-4 rounded border"
                    style={{
                      backgroundColor: themeSettings.primaryColor + '20',
                      borderColor: themeSettings.primaryColor,
                      fontFamily: themeSettings.fontFamily,
                      fontSize: themeSettings.fontSize === 'small' ? '14px' : themeSettings.fontSize === 'large' ? '18px' : '16px'
                    }}
                  >
                    <p style={{ color: themeSettings.primaryColor, fontWeight: 'bold' }}>
                      Minta cím a kiválasztott beállításokkal
                    </p>
                    <p style={{ color: themeSettings.secondaryColor }}>
                      Ez egy minta szöveg, amely megmutatja, hogyan nézne ki az alkalmazás az új beállításokkal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fő App komponens routing-gal
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;