import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Status translations
const statusTranslations = {
  'RECEIVED': 'Beérkezett',
  'IN_PROGRESS': 'Vizsgálat alatt', 
  'QUOTED': 'Árajánlat készült',
  'ACCEPTED': 'Elfogadva',
  'REJECTED': 'Elutasítva',
  'WORKING': 'Javítás alatt',
  'READY': 'Kész',
  'DELIVERED': 'Átvett'
};

const statusColors = {
  'RECEIVED': 'bg-blue-100 text-blue-800',
  'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
  'QUOTED': 'bg-purple-100 text-purple-800', 
  'ACCEPTED': 'bg-green-100 text-green-800',
  'REJECTED': 'bg-red-100 text-red-800',
  'WORKING': 'bg-orange-100 text-orange-800',
  'READY': 'bg-teal-100 text-teal-800',
  'DELIVERED': 'bg-gray-100 text-gray-800'
};

// Dashboard Component
const Dashboard = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    ready: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      const response = await axios.get(`${API}/work-orders`);
      const orders = response.data;
      setWorkOrders(orders);
      
      // Calculate stats
      setStats({
        total: orders.length,
        inProgress: orders.filter(o => ['RECEIVED', 'IN_PROGRESS', 'QUOTED', 'ACCEPTED', 'WORKING'].includes(o.status)).length,
        ready: orders.filter(o => o.status === 'READY').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Hiba a munkalapok betöltésekor:', error);
      setLoading(false);
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
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔧 Turbó Szerviz Kezelő
          </h1>
          <p className="text-gray-600">
            Teljes körű turbófeltöltő javítás kezelése
          </p>
        </header>

        {/* Navigation */}
        <nav className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <Link to="/clients" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium">
              👥 Ügyfelek
            </Link>
            <Link to="/work-orders" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium">
              📋 Munkalapok
            </Link>
            <Link to="/new-work-order" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 font-medium">
              ➕ Új Munkalap
            </Link>
            <Link to="/parts" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-medium">
              🔧 Alkatrészek
            </Link>
          </div>
        </nav>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Összes munka</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Folyamatban</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Kész</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ready}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-100 mr-4">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Átvett</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Work Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Legújabb munkalapok</h2>
            <Link to="/work-orders" className="text-blue-500 hover:text-blue-600 font-medium">
              Összes megtekintése →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Munkalap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ügyfél
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turbó kód
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Státusz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Összeg
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.work_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{order.client_name}</div>
                        <div className="text-xs text-gray-400">{order.client_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-mono">{order.turbo_code}</div>
                      <div className="text-xs text-gray-400">{order.vehicle_info}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusTranslations[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-bold">{order.total_amount.toFixed(0)}€</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {workOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Még nincsenek munkalapok</p>
              <Link to="/new-work-order" className="text-blue-500 hover:text-blue-600 font-medium">
                Hozz létre egy újat →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Clients Component
const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    company_name: '',
    tax_number: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async (search = '') => {
    try {
      const response = await axios.get(`${API}/clients${search ? `?search=${search}` : ''}`);
      setClients(response.data);
    } catch (error) {
      console.error('Hiba az ügyfelek betöltésekor:', error);
    }
  };

  const handleSearch = () => {
    loadClients(searchTerm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await axios.put(`${API}/clients/${editingClient.id}`, formData);
      } else {
        await axios.post(`${API}/clients`, formData);
      }
      
      setFormData({
        name: '', phone: '', email: '', address: '', 
        company_name: '', tax_number: '', notes: ''
      });
      setShowForm(false);
      setEditingClient(null);
      loadClients(searchTerm);
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült menteni'));
    }
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      company_name: client.company_name || '',
      tax_number: client.tax_number || '',
      notes: client.notes || ''
    });
    setEditingClient(client);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">👥 Ügyfelek</h1>
            <p className="text-gray-600">Ügyfél adatbázis kezelése</p>
          </div>
          <Link to="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-medium">
            🏠 Vissza
          </Link>
        </div>

        {/* Search & Add Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Keresés név, telefon vagy cégnév szerint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
              >
                🔍
              </button>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium"
            >
              ➕ Új ügyfél
            </button>
          </div>
        </div>

        {/* Client Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingClient ? 'Ügyfél szerkesztése' : 'Új ügyfél hozzáadása'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Név *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cégnév
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cím
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adószám
                </label>
                <input
                  type="text"
                  value={formData.tax_number}
                  onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Megjegyzések
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium"
                >
                  ✅ Mentés
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClient(null);
                    setFormData({
                      name: '', phone: '', email: '', address: '', 
                      company_name: '', tax_number: '', notes: ''
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium"
                >
                  Mégsem
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Név
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kapcsolat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Céginformációk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      {client.notes && (
                        <div className="text-xs text-gray-500">{client.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{client.phone}</div>
                      {client.email && <div className="text-xs">{client.email}</div>}
                      {client.address && <div className="text-xs">{client.address}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{client.company_name || '-'}</div>
                      {client.tax_number && <div className="text-xs">{client.tax_number}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(client)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                      >
                        ✏️ Szerkesztés
                      </button>
                      <Link
                        to={`/new-work-order?client_id=${client.id}`}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                      >
                        📋 Új munka
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nincs találat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple placeholder components for now
const WorkOrders = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold mb-4">📋 Munkalapok</h1>
    <p>Munkalapok kezelése (fejlesztés alatt...)</p>
    <Link to="/" className="text-blue-500">← Vissza</Link>
  </div>
);

const NewWorkOrder = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold mb-4">➕ Új Munkalap</h1>
    <p>Új munkalap létrehozása (fejlesztés alatt...)</p>
    <Link to="/" className="text-blue-500">← Vissza</Link>
  </div>
);

const Parts = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold mb-4">🔧 Alkatrészek</h1>
    <p>Alkatrészek kezelése (fejlesztés alatt...)</p>
    <Link to="/" className="text-blue-500">← Vissza</Link>
  </div>
);

// Main App Component
function TurboApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/work-orders" element={<WorkOrders />} />
        <Route path="/new-work-order" element={<NewWorkOrder />} />
        <Route path="/parts" element={<Parts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default TurboApp;