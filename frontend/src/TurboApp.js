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
const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      const response = await axios.get(`${API}/work-orders`);
      setWorkOrders(response.data);
      setFilteredOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Hiba a munkalapok betöltésekor:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = workOrders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.work_number.includes(searchTerm) ||
        order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.turbo_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client_phone.includes(searchTerm)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, statusFilter, workOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/work-orders/${orderId}`, { status: newStatus });
      loadWorkOrders(); // Reload to get updated data
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült frissíteni'));
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {statusTranslations[status] || status}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    const icons = {
      'RECEIVED': '📥',
      'IN_PROGRESS': '🔍', 
      'QUOTED': '💰',
      'ACCEPTED': '✅',
      'REJECTED': '❌',
      'WORKING': '🔧',
      'READY': '🎉',
      'DELIVERED': '📦'
    };
    return icons[status] || '📋';
  };

  const showOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${API}/work-orders/${orderId}`);
      setSelectedOrder(response.data);
      setShowDetails(true);
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült betölteni'));
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Munkalapok</h1>
            <p className="text-gray-600">Összes turbó javítási munkalap áttekintése</p>
          </div>
          <div className="flex gap-2">
            <Link to="/new-work-order" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium">
              ➕ Új munkalap
            </Link>
            <Link to="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-medium">
              🏠 Vissza
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {Object.entries(statusTranslations).map(([status, label]) => {
            const count = workOrders.filter(order => order.status === status).length;
            return (
              <div key={status} className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-2xl mb-2">{getStatusIcon(status)}</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-600">{label}</div>
              </div>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Keresés munkalap szám, ügyfél név, telefon vagy turbó kód szerint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Összes státusz</option>
                {Object.entries(statusTranslations).map(([status, label]) => (
                  <option key={status} value={status}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beérkezés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">#{order.work_number}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('hu-HU')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.client_name}</div>
                      <div className="text-xs text-gray-500">{order.client_phone}</div>
                      {order.vehicle_info && (
                        <div className="text-xs text-gray-400">{order.vehicle_info}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900">{order.turbo_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(order.status)}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          {Object.entries(statusTranslations).map(([status, label]) => (
                            <option key={status} value={status}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {order.total_amount.toFixed(0)}€
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.received_date).toLocaleDateString('hu-HU')}
                      {order.estimated_completion && (
                        <div className="text-xs text-blue-600">
                          Kész: {new Date(order.estimated_completion).toLocaleDateString('hu-HU')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => showOrderDetails(order.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                      >
                        👁️ Részletek
                      </button>
                      <button
                        onClick={() => window.open(`/work-orders/${order.id}/print`, '_blank')}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs"
                      >
                        🖨️ Nyomtat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {workOrders.length === 0 ? (
                  <>
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-lg">Még nincsenek munkalapok</p>
                    <p className="text-sm">Hozz létre az elsőt!</p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-lg">Nincs találat a keresési feltételeknek</p>
                  </>
                )}
              </div>
              <Link 
                to="/new-work-order" 
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium"
              >
                ➕ Új munkalap létrehozása
              </Link>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Munkalap #{selectedOrder.work_number}
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">👥 Ügyfél információk</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Név:</strong> CORVAST CSABA</div>
                      <div><strong>Telefon:</strong> 0740967539</div>
                      <div><strong>Email:</strong> -</div>
                      <div><strong>Cím:</strong> -</div>
                    </div>
                  </div>

                  {/* Turbo Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">🔧 Turbó információk</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Kód:</strong> <span className="font-mono">{selectedOrder.turbo_code}</span></div>
                      <div><strong>Beérkezés:</strong> {new Date(selectedOrder.received_date).toLocaleDateString('hu-HU')}</div>
                      {selectedOrder.estimated_completion && (
                        <div><strong>Becsült kész:</strong> {new Date(selectedOrder.estimated_completion).toLocaleDateString('hu-HU')}</div>
                      )}
                    </div>
                  </div>

                  {/* Parts */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">🔧 Kiválasztott alkatrészek</h4>
                    {selectedOrder.parts && selectedOrder.parts.length > 0 ? (
                      <div className="space-y-2">
                        {selectedOrder.parts.filter(p => p.selected).map((part, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <div className="font-medium">{part.category}</div>
                              <div className="font-mono text-xs text-gray-600">{part.part_code}</div>
                              <div className="text-xs text-gray-500">{part.supplier}</div>
                            </div>
                            <div className="font-bold text-blue-600">{part.price.toFixed(0)}€</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Nincsenek kiválasztott alkatrészek</p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">💰 Árazás</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Curatat (tisztítás):</span>
                        <span className="font-medium">{selectedOrder.cleaning_price}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recond (felújítás):</span>
                        <span className="font-medium">{selectedOrder.reconditioning_price}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Turbo:</span>
                        <span className="font-medium">{selectedOrder.turbo_price}€</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Összesen:</span>
                        <span className="text-green-600">
                          {(selectedOrder.cleaning_price + selectedOrder.reconditioning_price + selectedOrder.turbo_price + 
                           (selectedOrder.parts?.filter(p => p.selected).reduce((sum, p) => sum + p.price, 0) || 0)).toFixed(0)}€
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-gray-800 mb-3">📋 Státusz és workflow</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={selectedOrder.status_passed ? 'text-green-600' : 'text-gray-400'}>
                          {selectedOrder.status_passed ? '✅' : '☐'}
                        </span>
                        <span>OK (PASSED)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={selectedOrder.status_refused ? 'text-red-600' : 'text-gray-400'}>
                          {selectedOrder.status_refused ? '❌' : '☐'}
                        </span>
                        <span>REFUZAT</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={selectedOrder.quote_sent ? 'text-purple-600' : 'text-gray-400'}>
                          {selectedOrder.quote_sent ? '📤' : '☐'}
                        </span>
                        <span>OFERTAT</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={selectedOrder.quote_accepted ? 'text-blue-600' : 'text-gray-400'}>
                          {selectedOrder.quote_accepted ? '✅' : '☐'}
                        </span>
                        <span>ACCEPT</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium"
                  >
                    Bezárás
                  </button>
                  <button
                    onClick={() => window.open(`/work-orders/${selectedOrder.id}/print`, '_blank')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium"
                  >
                    🖨️ Nyomtatás
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NewWorkOrder = () => {
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [turboParts, setTurboParts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [workOrderData, setWorkOrderData] = useState({
    turbo_code: '',
    parts: [],
    status_passed: false,
    status_refused: false,
    cleaning_price: 170,
    reconditioning_price: 170,
    turbo_price: 240,
    quote_sent: false,
    quote_accepted: false,
    estimated_completion: ''
  });
  const [searchClient, setSearchClient] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    company_name: ''
  });

  useEffect(() => {
    loadClients();
    loadTurboParts();
  }, []);

  const loadClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('Hiba az ügyfelek betöltésekor:', error);
    }
  };

  const loadTurboParts = async () => {
    try {
      const response = await axios.get(`${API}/turbo-parts`);
      setTurboParts(response.data);
    } catch (error) {
      console.error('Hiba az alkatrészek betöltésekor:', error);
    }
  };

  const loadVehicles = async (clientId) => {
    try {
      const response = await axios.get(`${API}/vehicles?client_id=${clientId}`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Hiba a járművek betöltésekor:', error);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    loadVehicles(client.id);
  };

  const handleAddNewClient = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/clients`, newClient);
      setSelectedClient(response.data);
      setShowNewClientForm(false);
      setNewClient({ name: '', phone: '', email: '', address: '', company_name: '' });
      loadClients();
      loadVehicles(response.data.id);
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült hozzáadni az ügyfelet'));
    }
  };

  const handlePartToggle = (part) => {
    const updatedParts = [...workOrderData.parts];
    const existingIndex = updatedParts.findIndex(p => p.part_id === part.id);
    
    if (existingIndex >= 0) {
      updatedParts[existingIndex].selected = !updatedParts[existingIndex].selected;
    } else {
      updatedParts.push({
        part_id: part.id,
        part_code: part.part_code,
        category: part.category,
        supplier: part.supplier,
        price: part.price,
        selected: true
      });
    }
    
    setWorkOrderData({...workOrderData, parts: updatedParts});
  };

  const isPartSelected = (partId) => {
    const part = workOrderData.parts.find(p => p.part_id === partId);
    return part ? part.selected : false;
  };

  const calculateTotal = () => {
    const partsTotal = workOrderData.parts
      .filter(p => p.selected)
      .reduce((sum, p) => sum + p.price, 0);
    
    return workOrderData.cleaning_price + 
           workOrderData.reconditioning_price + 
           workOrderData.turbo_price + 
           partsTotal;
  };

  const handleSubmit = async () => {
    if (!selectedClient || !workOrderData.turbo_code) {
      alert('Ügyfél és turbó kód megadása kötelező!');
      return;
    }

    try {
      // Create work order
      const workOrderPayload = {
        client_id: selectedClient.id,
        vehicle_id: selectedVehicle?.id || null,
        turbo_code: workOrderData.turbo_code
      };

      const response = await axios.post(`${API}/work-orders`, workOrderPayload);
      
      // Update with additional data
      const updatePayload = {
        parts: workOrderData.parts,
        status_passed: workOrderData.status_passed,
        status_refused: workOrderData.status_refused,
        cleaning_price: workOrderData.cleaning_price,
        reconditioning_price: workOrderData.reconditioning_price,
        turbo_price: workOrderData.turbo_price,
        quote_sent: workOrderData.quote_sent,
        quote_accepted: workOrderData.quote_accepted,
        estimated_completion: workOrderData.estimated_completion || null
      };

      await axios.put(`${API}/work-orders/${response.data.id}`, updatePayload);
      
      alert(`Munkalap sikeresen létrehozva! Sorszám: #${response.data.work_number}`);
      
      // Reset form
      setSelectedClient(null);
      setSelectedVehicle(null);
      setVehicles([]);
      setWorkOrderData({
        turbo_code: '',
        parts: [],
        status_passed: false,
        status_refused: false,
        cleaning_price: 170,
        reconditioning_price: 170,
        turbo_price: 240,
        quote_sent: false,
        quote_accepted: false,
        estimated_completion: ''
      });
      
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült létrehozni a munkalapot'));
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.phone.includes(searchClient)
  );

  const partsByCategory = {
    'C.H.R.A': turboParts.filter(p => p.category === 'C.H.R.A'),
    'GEO': turboParts.filter(p => p.category === 'GEO'),
    'ACT': turboParts.filter(p => p.category === 'ACT'),
    'SET.GAR': turboParts.filter(p => p.category === 'SET.GAR')
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Új Munkalap</h1>
            <p className="text-gray-600">Turbó javítási munkalap létrehozása</p>
          </div>
          <Link to="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-medium">
            🏠 Vissza
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Client & Vehicle Selection */}
          <div className="space-y-6">
            {/* Client Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">👥 Ügyfél kiválasztása</h3>
              
              {!selectedClient ? (
                <div>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Keresés név vagy telefon szerint..."
                      value={searchClient}
                      onChange={(e) => setSearchClient(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto mb-4">
                    {filteredClients.map(client => (
                      <div
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className="p-3 border border-gray-200 rounded mb-2 cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                      >
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.phone}</div>
                        {client.company_name && (
                          <div className="text-sm text-gray-500">{client.company_name}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowNewClientForm(true)}
                    className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 font-medium"
                  >
                    ➕ Új ügyfél hozzáadása
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-blue-800">{selectedClient.name}</div>
                      <div className="text-blue-600">{selectedClient.phone}</div>
                      {selectedClient.company_name && (
                        <div className="text-blue-600">{selectedClient.company_name}</div>
                      )}
                      {selectedClient.address && (
                        <div className="text-sm text-blue-500">{selectedClient.address}</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedClient(null);
                        setSelectedVehicle(null);
                        setVehicles([]);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Selection */}
            {selectedClient && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">🚗 Jármű (opcionális)</h3>
                
                {vehicles.length > 0 ? (
                  <div className="space-y-2">
                    {vehicles.map(vehicle => (
                      <div
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={`p-3 border rounded cursor-pointer ${
                          selectedVehicle?.id === vehicle.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </div>
                        {vehicle.license_plate && (
                          <div className="text-sm text-gray-600">Rendszám: {vehicle.license_plate}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    Nincs regisztrált jármű ehhez az ügyfélhez
                  </div>
                )}
              </div>
            )}

            {/* Turbo Code */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">🔧 Turbó kód</h3>
              <input
                type="text"
                placeholder="pl. 5490-970-0071"
                value={workOrderData.turbo_code}
                onChange={(e) => setWorkOrderData({...workOrderData, turbo_code: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 font-mono text-lg"
              />
            </div>
          </div>

          {/* Right Side - Parts Selection & Pricing */}
          <div className="space-y-6">
            {/* Parts Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">🔧 Alkatrészek kiválasztása</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(partsByCategory).map(([category, parts]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">{category}</h4>
                    <div className="space-y-2">
                      {parts.map(part => (
                        <label
                          key={part.id}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isPartSelected(part.id)}
                            onChange={() => handlePartToggle(part)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-mono text-sm">{part.part_code}</div>
                            <div className="text-xs text-gray-500">{part.supplier}</div>
                          </div>
                          <div className="font-medium text-blue-600">
                            {part.price.toFixed(0)} LEI
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Árazás</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium">Curatat (tisztítás):</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={workOrderData.cleaning_price}
                      onChange={(e) => setWorkOrderData({...workOrderData, cleaning_price: parseFloat(e.target.value) || 0})}
                      className="w-20 p-2 border border-gray-300 rounded text-right"
                    />
                    <span>€</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium">Recond (felújítás):</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={workOrderData.reconditioning_price}
                      onChange={(e) => setWorkOrderData({...workOrderData, reconditioning_price: parseFloat(e.target.value) || 0})}
                      className="w-20 p-2 border border-gray-300 rounded text-right"
                    />
                    <span>€</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium">Turbo:</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={workOrderData.turbo_price}
                      onChange={(e) => setWorkOrderData({...workOrderData, turbo_price: parseFloat(e.target.value) || 0})}
                      className="w-20 p-2 border border-gray-300 rounded text-right"
                    />
                    <span>€</span>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Összesen:</span>
                  <span className="text-blue-600">{calculateTotal().toFixed(0)}€</span>
                </div>
              </div>
            </div>

            {/* Status & Workflow */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Státusz & Workflow</h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={workOrderData.status_passed}
                      onChange={(e) => setWorkOrderData({...workOrderData, status_passed: e.target.checked})}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-green-700 font-medium">✅ OK (PASSED)</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={workOrderData.status_refused}
                      onChange={(e) => setWorkOrderData({...workOrderData, status_refused: e.target.checked})}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className="text-red-700 font-medium">❌ REFUZAT</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={workOrderData.quote_sent}
                      onChange={(e) => setWorkOrderData({...workOrderData, quote_sent: e.target.checked})}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-purple-700 font-medium">📤 OFERTAT</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={workOrderData.quote_accepted}
                      onChange={(e) => setWorkOrderData({...workOrderData, quote_accepted: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-blue-700 font-medium">✅ ACCEPT</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TERMEN ESTIMATIV (kész dátum):
                  </label>
                  <input
                    type="date"
                    value={workOrderData.estimated_completion}
                    onChange={(e) => setWorkOrderData({...workOrderData, estimated_completion: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 text-white py-4 px-6 rounded-lg hover:bg-green-600 font-bold text-lg"
            >
              📋 Munkalap létrehozása
            </button>
          </div>
        </div>

        {/* New Client Form Modal */}
        {showNewClientForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Új ügyfél hozzáadása</h3>
              <form onSubmit={handleAddNewClient}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Név *</label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cégnév</label>
                    <input
                      type="text"
                      value={newClient.company_name}
                      onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cím</label>
                    <input
                      type="text"
                      value={newClient.address}
                      onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 font-medium"
                  >
                    Hozzáadás
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewClientForm(false);
                      setNewClient({ name: '', phone: '', email: '', address: '', company_name: '' });
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 font-medium"
                  >
                    Mégsem
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Parts = () => {
  const [workProcesses, setWorkProcesses] = useState([]);
  const [turboParts, setTurboParts] = useState([]);
  const [activeTab, setActiveTab] = useState('processes');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Work Process Form Data
  const [processFormData, setProcessFormData] = useState({
    name: '',
    category: '',
    estimated_time: 0,
    base_price: 0
  });

  // Turbo Part Form Data  
  const [partFormData, setPartFormData] = useState({
    category: '',
    part_code: '',
    supplier: '',
    price: 0
  });

  const processCategories = [
    'Diagnosis', 'Cleaning', 'Assembly', 'Testing', 'Repair', 'Maintenance'
  ];

  const partCategories = [
    'C.H.R.A', 'GEO', 'ACT', 'SET.GAR'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadWorkProcesses(), loadTurboParts()]);
    setLoading(false);
  };

  const loadWorkProcesses = async () => {
    try {
      const response = await axios.get(`${API}/work-processes`);
      setWorkProcesses(response.data);
    } catch (error) {
      console.error('Hiba a munkafolyamatok betöltésekor:', error);
    }
  };

  const loadTurboParts = async () => {
    try {
      const response = await axios.get(`${API}/turbo-parts`);
      setTurboParts(response.data);
    } catch (error) {
      console.error('Hiba az alkatrészek betöltésekor:', error);
    }
  };

  // Work Process Handlers
  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && activeTab === 'processes') {
        await axios.put(`${API}/work-processes/${editingItem.id}`, processFormData);
      } else {
        await axios.post(`${API}/work-processes`, processFormData);
      }
      
      setProcessFormData({ name: '', category: '', estimated_time: 0, base_price: 0 });
      setShowForm(false);
      setEditingItem(null);
      loadWorkProcesses();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült menteni'));
    }
  };

  const handleProcessEdit = (process) => {
    setProcessFormData({
      name: process.name,
      category: process.category,
      estimated_time: process.estimated_time,
      base_price: process.base_price
    });
    setEditingItem(process);
    setShowForm(true);
  };

  const handleProcessDelete = async (processId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a munkafolyamatot?')) return;
    
    try {
      await axios.delete(`${API}/work-processes/${processId}`);
      loadWorkProcesses();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült törölni'));
    }
  };

  // Turbo Part Handlers
  const handlePartSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && activeTab === 'parts') {
        await axios.put(`${API}/turbo-parts/${editingItem.id}`, partFormData);
      } else {
        await axios.post(`${API}/turbo-parts`, partFormData);
      }
      
      setPartFormData({ category: '', part_code: '', supplier: '', price: 0 });
      setShowForm(false);
      setEditingItem(null);
      loadTurboParts();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült menteni'));
    }
  };

  const handlePartEdit = (part) => {
    setPartFormData({
      category: part.category,
      part_code: part.part_code,
      supplier: part.supplier,
      price: part.price
    });
    setEditingItem(part);
    setShowForm(true);
  };

  const handlePartDelete = async (partId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt az alkatrészt?')) return;
    
    try {
      await axios.delete(`${API}/turbo-parts/${partId}`);
      loadTurboParts();
    } catch (error) {
      alert('Hiba: ' + (error.response?.data?.detail || 'Nem sikerült törölni'));
    }
  };

  const filteredProcesses = workProcesses.filter(process =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParts = turboParts.filter(part =>
    part.part_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🔧 Alkatrészek & Munkák</h1>
            <p className="text-gray-600">Munkafolyamatok és alkatrészek adatbázisa</p>
          </div>
          <Link to="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-medium">
            🏠 Vissza
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('processes');
                setShowForm(false);
                setEditingItem(null);
              }}
              className={`px-6 py-4 font-medium ${activeTab === 'processes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ⚙️ Munkafolyamatok ({workProcesses.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('parts');
                setShowForm(false);
                setEditingItem(null);
              }}
              className={`px-6 py-4 font-medium ${activeTab === 'parts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🔧 Turbó alkatrészek ({turboParts.length})
            </button>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Keresés ${activeTab === 'processes' ? 'munkafolyamatok' : 'alkatrészek'} között...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-3 text-gray-400">🔍</span>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingItem(null);
                if (activeTab === 'processes') {
                  setProcessFormData({ name: '', category: '', estimated_time: 0, base_price: 0 });
                } else {
                  setPartFormData({ category: '', part_code: '', supplier: '', price: 0 });
                }
              }}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium"
            >
              ➕ Új {activeTab === 'processes' ? 'munkafolyamat' : 'alkatrész'}
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingItem ? 'Szerkesztés' : 'Új hozzáadása'} - {activeTab === 'processes' ? 'Munkafolyamat' : 'Alkatrész'}
                </h3>

                {activeTab === 'processes' ? (
                  <form onSubmit={handleProcessSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Munkafolyamat neve *
                        </label>
                        <input
                          type="text"
                          value={processFormData.name}
                          onChange={(e) => setProcessFormData({...processFormData, name: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="pl. Szétszerelés, Tisztítás, Diagnosztika"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kategória *
                        </label>
                        <select
                          value={processFormData.category}
                          onChange={(e) => setProcessFormData({...processFormData, category: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Válassz kategóriát...</option>
                          {processCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Becsült idő (perc)
                        </label>
                        <input
                          type="number"
                          value={processFormData.estimated_time}
                          onChange={(e) => setProcessFormData({...processFormData, estimated_time: parseInt(e.target.value) || 0})}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alapár (LEI)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={processFormData.base_price}
                          onChange={(e) => setProcessFormData({...processFormData, base_price: parseFloat(e.target.value) || 0})}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button
                        type="submit"
                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 font-medium"
                      >
                        {editingItem ? 'Frissítés' : 'Hozzáadás'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingItem(null);
                        }}
                        className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 font-medium"
                      >
                        Mégsem
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePartSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kategória *
                        </label>
                        <select
                          value={partFormData.category}
                          onChange={(e) => setPartFormData({...partFormData, category: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Válassz kategóriát...</option>
                          {partCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alkatrész kód *
                        </label>
                        <input
                          type="text"
                          value={partFormData.part_code}
                          onChange={(e) => setPartFormData({...partFormData, part_code: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 font-mono"
                          placeholder="pl. 1303-090-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beszállító *
                        </label>
                        <input
                          type="text"
                          value={partFormData.supplier}
                          onChange={(e) => setPartFormData({...partFormData, supplier: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="pl. Melett, Vallion, Cer"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ár (LEI)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={partFormData.price}
                          onChange={(e) => setPartFormData({...partFormData, price: parseFloat(e.target.value) || 0})}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button
                        type="submit"
                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 font-medium"
                      >
                        {editingItem ? 'Frissítés' : 'Hozzáadás'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingItem(null);
                        }}
                        className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 font-medium"
                      >
                        Mégsem
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'processes' ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Munkafolyamat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategória
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Becsült idő
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alapár
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Műveletek
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProcesses.map((process) => (
                    <tr key={process.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{process.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {process.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {process.estimated_time > 0 ? `${process.estimated_time} perc` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {process.base_price > 0 ? `${process.base_price} LEI` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleProcessEdit(process)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                        >
                          ✏️ Szerkesztés
                        </button>
                        <button
                          onClick={() => handleProcessDelete(process.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                        >
                          🗑️ Törlés
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProcesses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <div className="text-6xl mb-4">⚙️</div>
                  <p className="text-lg">Még nincsenek munkafolyamatok</p>
                </div>
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium"
                >
                  ➕ Első munkafolyamat hozzáadása
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategória
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alkatrész kód
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beszállító
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ár
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Műveletek
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParts.map((part) => (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {part.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900">{part.part_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {part.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {part.price} LEI
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handlePartEdit(part)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                        >
                          ✏️ Szerkesztés
                        </button>
                        <button
                          onClick={() => handlePartDelete(part.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                        >
                          🗑️ Törlés
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredParts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <div className="text-6xl mb-4">🔧</div>
                  <p className="text-lg">Még nincsenek turbó alkatrészek</p>
                </div>
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium"
                >
                  ➕ Első alkatrész hozzáadása
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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