import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';import { motion, AnimatePresence } from 'framer-motion';

import { Plus, Edit, Trash2, Clock, MapPin, User, Calendar, Eye, EyeOff } from 'lucide-react';import { Plus, Edit, Trash2, Clock, MapPin, User, Calendar, Eye, EyeOff } from 'lucide-react';



interface AgendaItem {interface AgendaItem {

  id: number;  id: number;

  title: string;  title: string;

  description: string;  description: string;

  start_time: string;  start_time: string;

  end_time: string;  end_time: string;

  agenda_date: string;  agenda_date: string;

  location: string;  location: string;

  speaker: string;  speaker: string;

  is_active: number;  is_active: number;

  created_at: string;  created_at: string;

  updated_at: string;  updated_at: string;

}}



interface FormData {interface FormData {

  title: string;  title: string;

  description: string;  description: string;

  startTime: string;  startTime: string;

  endTime: string;  endTime: string;

  date: string;  date: string;

  location: string;  location: string;

  speaker: string;  speaker: string;

  is_active: boolean;  is_active: boolean;

}}



const AgendaManagement: React.FC = () => {const AgendaManagement: React.FC = () => {

  const [agendas, setAgendas] = useState<AgendaItem[]>([]);  const [agendas, setAgendas] = useState<AgendaItem[]>([]);

  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);

  const [formData, setFormData] = useState<FormData>({  const [formData, setFormData] = useState<FormData>({

    title: '',    title: '',

    description: '',    description: '',

    startTime: '',    startTime: '',

    endTime: '',    endTime: '',

    date: '',    date: '',

    location: '',    location: '',

    speaker: '',    speaker: '',

    is_active: true    is_active: true

  });  });



  // Use the new API configuration



  useEffect(() => {  useEffect(() => {

    fetchAgendas();    fetchAgendas();

  }, []);  }, []);



  const fetchAgendas = async () => {  const fetchAgendas = async () => {

    try {    try {

      setLoading(true);      setLoading(true);

      setError(null);      setError(null);

            

      const response = await fetch(`${API_BASE_URL}/api/agendas`);      const response = await fetch(`${API_BASE_URL}/api/agendas`);

            

      if (!response.ok) {      if (!response.ok) {

        throw new Error(`HTTP error! status: ${response.status}`);        throw new Error(`HTTP error! status: ${response.status}`);

      }      }

            

      const data = await response.json();      const data = await response.json();

      setAgendas(Array.isArray(data) ? data : []);      setAgendas(Array.isArray(data) ? data : []);

    } catch (error) {    } catch (error) {

      console.error('Error fetching agendas:', error);      console.error('Error fetching agendas:', error);

      setError(error instanceof Error ? error.message : 'Gagal memuat agenda');      setError(error instanceof Error ? error.message : 'Gagal memuat agenda');

      setAgendas([]);      setAgendas([]);

    } finally {    } finally {

      setLoading(false);      setLoading(false);

    }    }

  };  };



  const handleSubmit = async (e: React.FormEvent) => {  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();    e.preventDefault();

        

    try {    try {

      const token = localStorage.getItem('token');      const token = localStorage.getItem('token');

      if (!token) {      if (!token) {

        setError('Token tidak ditemukan. Silakan login kembali.');        setError('Token tidak ditemukan. Silakan login kembali.');

        return;        return;

      }      }



      const requestData = {      const requestData = {

        title: formData.title,        title: formData.title,

        description: formData.description,        description: formData.description,

        startTime: formData.startTime,        startTime: formData.startTime,

        endTime: formData.endTime,        endTime: formData.endTime,

        date: formData.date,        date: formData.date,

        location: formData.location,        location: formData.location,

        speaker: formData.speaker,        speaker: formData.speaker,

        is_active: formData.is_active        is_active: formData.is_active

      };      };



      const url = editingAgenda       const url = editingAgenda 

        ? `${API_BASE_URL}/api/agendas/${editingAgenda.id}`        ? `${API_BASE_URL}/api/agendas/${editingAgenda.id}`

        : `${API_BASE_URL}/api/agendas`;        : `${API_BASE_URL}/api/agendas`;

            

      const method = editingAgenda ? 'PUT' : 'POST';      const method = editingAgenda ? 'PUT' : 'POST';



      const response = await fetch(url, {      const response = await fetch(url, {

        method,        method,

        headers: {        headers: {

          'Content-Type': 'application/json',          'Content-Type': 'application/json',

          'Authorization': `Bearer ${token}`          'Authorization': `Bearer ${token}`

        },        },

        body: JSON.stringify(requestData)        body: JSON.stringify(requestData)

      });      });



      if (!response.ok) {      if (!response.ok) {

        const errorData = await response.json();        const errorData = await response.json();

        throw new Error(errorData.message || 'Gagal menyimpan agenda');        throw new Error(errorData.message || 'Gagal menyimpan agenda');

      }      }



      await fetchAgendas();      await fetchAgendas();

      setIsDialogOpen(false);      setIsDialogOpen(false);

      resetForm();      resetForm();

    } catch (error) {    } catch (error) {

      console.error('Error saving agenda:', error);      console.error('Error saving agenda:', error);

      setError(error instanceof Error ? error.message : 'Gagal menyimpan agenda');      setError(error instanceof Error ? error.message : 'Gagal menyimpan agenda');

    }    }

  };  };



  const handleDelete = async (id: number) => {  const handleDelete = async (id: number) => {

    if (!confirm('Apakah Anda yakin ingin menghapus agenda ini?')) return;    if (!confirm('Apakah Anda yakin ingin menghapus agenda ini?')) return;



    try {    try {

      const token = localStorage.getItem('token');      const token = localStorage.getItem('token');

      if (!token) {      if (!token) {

        setError('Token tidak ditemukan. Silakan login kembali.');        setError('Token tidak ditemukan. Silakan login kembali.');

        return;        return;

      }      }



      const response = await fetch(`${API_BASE_URL}/api/agendas/${id}`, {      const response = await fetch(`${API_BASE_URL}/api/agendas/${id}`, {

        method: 'DELETE',        method: 'DELETE',

        headers: {        headers: {

          'Authorization': `Bearer ${token}`          'Authorization': `Bearer ${token}`

        }        }

      });      });



      if (!response.ok) {      if (!response.ok) {

        throw new Error('Gagal menghapus agenda');        throw new Error('Gagal menghapus agenda');

      }      }



      await fetchAgendas();      await fetchAgendas();

    } catch (error) {    } catch (error) {

      console.error('Error deleting agenda:', error);      console.error('Error deleting agenda:', error);

      setError(error instanceof Error ? error.message : 'Gagal menghapus agenda');      setError(error instanceof Error ? error.message : 'Gagal menghapus agenda');

    }    }

  };  };



  const openCreateDialog = () => {  const openCreateDialog = () => {

    setEditingAgenda(null);    setEditingAgenda(null);

    resetForm();    resetForm();

    setIsDialogOpen(true);    setIsDialogOpen(true);

  };  };



  const openEditDialog = (agenda: AgendaItem) => {  const openEditDialog = (agenda: AgendaItem) => {

    setEditingAgenda(agenda);    setEditingAgenda(agenda);

    setFormData({    setFormData({

      title: agenda.title,      title: agenda.title,

      description: agenda.description,      description: agenda.description,

      startTime: agenda.start_time.substring(0, 5),      startTime: agenda.start_time.substring(0, 5),

      endTime: agenda.end_time.substring(0, 5),      endTime: agenda.end_time.substring(0, 5),

      date: agenda.agenda_date,      date: agenda.agenda_date,

      location: agenda.location,      location: agenda.location,

      speaker: agenda.speaker,      speaker: agenda.speaker,

      is_active: agenda.is_active === 1      is_active: agenda.is_active === 1

    });    });

    setIsDialogOpen(true);    setIsDialogOpen(true);

  };  };



  const resetForm = () => {  const resetForm = () => {

    setFormData({    setFormData({

      title: '',      title: '',

      description: '',      description: '',

      startTime: '',      startTime: '',

      endTime: '',      endTime: '',

      date: '',      date: '',

      location: '',      location: '',

      speaker: '',      speaker: '',

      is_active: true      is_active: true

    });    });

  };  };



  const formatDate = (dateString: string) => {  const formatDate = (dateString: string) => {

    return new Date(dateString).toLocaleDateString('id-ID', {    return new Date(dateString).toLocaleDateString('id-ID', {

      weekday: 'long',      weekday: 'long',

      year: 'numeric',      year: 'numeric',

      month: 'long',      month: 'long',

      day: 'numeric'      day: 'numeric'

    });    });

  };  };



  const formatTime = (timeString: string) => {  const formatTime = (timeString: string) => {

    return timeString.substring(0, 5);    return timeString.substring(0, 5);

  };  };



  return (  return (

    <div className="p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen">    <div className="p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen">

      {/* Header */}      {/* Header */}

      <div className="flex justify-between items-center mb-6">      <div className="flex justify-between items-center mb-6">

        <div>        <div>

          <h1 className="text-2xl font-bold text-white">Kelola Agenda</h1>          <h1 className="text-2xl font-bold text-white">Kelola Agenda</h1>

          <p className="text-gray-400 mt-1">Kelola jadwal acara dan kegiatan</p>          <p className="text-gray-400 mt-1">Kelola jadwal acara dan kegiatan</p>

        </div>        </div>

        <button         <button 

          onClick={openCreateDialog}          onClick={openCreateDialog}

          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"

        >        >

          <Plus className="w-4 h-4" />          <Plus className="w-4 h-4" />

          Tambah Agenda          Tambah Agenda

        </button>        </button>

      </div>      </div>



      {/* Error Message */}      {/* Error Message */}

      {error && (      {error && (

        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 text-red-200">        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 text-red-200">

          <p>Error: {error}</p>          <p>Error: {error}</p>

          <button onClick={fetchAgendas} className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded">          <button onClick={fetchAgendas} className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded">

            Coba Lagi            Coba Lagi

          </button>          </button>

        </div>        </div>

      )}      )}



      {/* Loading */}      {/* Loading */}

      {loading && (      {loading && (

        <div className="text-center py-8">        <div className="text-center py-8">

          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>

          <p className="text-gray-400 mt-2">Memuat agenda...</p>          <p className="text-gray-400 mt-2">Memuat agenda...</p>

        </div>        </div>

      )}      )}



      {/* Agenda Grid */}      {/* Agenda Grid */}

      {!loading && (      {!loading && (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <AnimatePresence>          <AnimatePresence>

            {agendas.map((agenda) => (            {agendas.map((agenda) => (

              <motion.div              <motion.div

                key={agenda.id}                key={agenda.id}

                initial={{ opacity: 0, scale: 0.9 }}                initial={{ opacity: 0, scale: 0.9 }}

                animate={{ opacity: 1, scale: 1 }}                animate={{ opacity: 1, scale: 1 }}

                exit={{ opacity: 0, scale: 0.9 }}                exit={{ opacity: 0, scale: 0.9 }}

                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300"                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300"

              >              >

                {/* Status Badge */}                {/* Status Badge */}

                <div className="flex justify-between items-start mb-4">                <div className="flex justify-between items-start mb-4">

                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${

                    agenda.is_active === 1                     agenda.is_active === 1 

                      ? 'bg-green-900/50 text-green-400 border border-green-500/30'                       ? 'bg-green-900/50 text-green-400 border border-green-500/30' 

                      : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'                      : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'

                  }`}>                  }`}>

                    {agenda.is_active === 1 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}                    {agenda.is_active === 1 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}

                    {agenda.is_active === 1 ? 'Aktif' : 'Non-Aktif'}                    {agenda.is_active === 1 ? 'Aktif' : 'Non-Aktif'}

                  </span>                  </span>

                  <div className="flex gap-2">                  <div className="flex gap-2">

                    <button                    <button

                      onClick={() => openEditDialog(agenda)}                      onClick={() => openEditDialog(agenda)}

                      className="text-yellow-400 hover:text-yellow-300 p-1 rounded"                      className="text-yellow-400 hover:text-yellow-300 p-1 rounded"

                    >                    >

                      <Edit className="w-4 h-4" />                      <Edit className="w-4 h-4" />

                    </button>                    </button>

                    <button                    <button

                      onClick={() => handleDelete(agenda.id)}                      onClick={() => handleDelete(agenda.id)}

                      className="text-red-400 hover:text-red-300 p-1 rounded"                      className="text-red-400 hover:text-red-300 p-1 rounded"

                    >                    >

                      <Trash2 className="w-4 h-4" />                      <Trash2 className="w-4 h-4" />

                    </button>                    </button>

                  </div>                  </div>

                </div>                </div>



                {/* Title */}                {/* Title */}

                <h3 className="text-xl font-bold text-white mb-2">{agenda.title}</h3>                <h3 className="text-xl font-bold text-white mb-2">{agenda.title}</h3>



                {/* Description */}                {/* Description */}

                <p className="text-gray-300 mb-4 line-clamp-2">{agenda.description}</p>                <p className="text-gray-300 mb-4 line-clamp-2">{agenda.description}</p>



                {/* Details */}                {/* Details */}

                <div className="space-y-2 text-sm">                <div className="space-y-2 text-sm">

                  <div className="flex items-center gap-2 text-gray-400">                  <div className="flex items-center gap-2 text-gray-400">

                    <Calendar className="w-4 h-4" />                    <Calendar className="w-4 h-4" />

                    <span>{formatDate(agenda.agenda_date)}</span>                    <span>{formatDate(agenda.agenda_date)}</span>

                  </div>                  </div>

                  <div className="flex items-center gap-2 text-gray-400">                  <div className="flex items-center gap-2 text-gray-400">

                    <Clock className="w-4 h-4" />                    <Clock className="w-4 h-4" />

                    <span>{formatTime(agenda.start_time)} - {formatTime(agenda.end_time)}</span>                    <span>{formatTime(agenda.start_time)} - {formatTime(agenda.end_time)}</span>

                  </div>                  </div>

                  <div className="flex items-center gap-2 text-gray-400">                  <div className="flex items-center gap-2 text-gray-400">

                    <MapPin className="w-4 h-4" />                    <MapPin className="w-4 h-4" />

                    <span>{agenda.location}</span>                    <span>{agenda.location}</span>

                  </div>                  </div>

                  <div className="flex items-center gap-2 text-gray-400">                  <div className="flex items-center gap-2 text-gray-400">

                    <User className="w-4 h-4" />                    <User className="w-4 h-4" />

                    <span>{agenda.speaker}</span>                    <span>{agenda.speaker}</span>

                  </div>                  </div>

                </div>                </div>

              </motion.div>              </motion.div>

            ))}            ))}

          </AnimatePresence>          </AnimatePresence>

        </div>        </div>

      )}      )}



      {/* Empty State */}      {/* Empty State */}

      {!loading && agendas.length === 0 && (      {!loading && agendas.length === 0 && (

        <div className="text-center py-12">        <div className="text-center py-12">

          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />

          <h3 className="text-xl font-semibold text-gray-400 mb-2">Belum ada agenda</h3>          <h3 className="text-xl font-semibold text-gray-400 mb-2">Belum ada agenda</h3>

          <p className="text-gray-500 mb-4">Mulai dengan menambahkan agenda pertama Anda</p>          <p className="text-gray-500 mb-4">Mulai dengan menambahkan agenda pertama Anda</p>

          <button           <button 

            onClick={openCreateDialog}            onClick={openCreateDialog}

            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-6 py-2 rounded-lg"            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-6 py-2 rounded-lg"

          >          >

            Tambah Agenda            Tambah Agenda

          </button>          </button>

        </div>        </div>

      )}      )}



      {/* Dialog */}      {/* Dialog */}

      {isDialogOpen && (      {isDialogOpen && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold text-white mb-4">            <h2 className="text-xl font-bold text-white mb-4">

              {editingAgenda ? 'Edit Agenda' : 'Tambah Agenda Baru'}              {editingAgenda ? 'Edit Agenda' : 'Tambah Agenda Baru'}

            </h2>            </h2>

            <p className="text-gray-400 mb-6">            <p className="text-gray-400 mb-6">

              {editingAgenda ? 'Perbarui informasi agenda' : 'Isi form di bawah untuk menambahkan agenda baru'}              {editingAgenda ? 'Perbarui informasi agenda' : 'Isi form di bawah untuk menambahkan agenda baru'}

            </p>            </p>



            <form onSubmit={handleSubmit} className="space-y-4">            <form onSubmit={handleSubmit} className="space-y-4">

              <div>              <div>

                <label className="block text-gray-300 mb-2">Judul Agenda*</label>                <label className="block text-gray-300 mb-2">Judul Agenda*</label>

                <input                <input

                  type="text"                  type="text"

                  value={formData.title}                  value={formData.title}

                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}

                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"

                  required                  required

                />                />

              </div>              </div>



              <div>              <div>

                <label className="block text-gray-300 mb-2">Deskripsi*</label>                <label className="block text-gray-300 mb-2">Deskripsi*</label>

                <textarea                <textarea

                  value={formData.description}                  value={formData.description}

                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}

                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-24"                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-24"

                  required                  required

                />                />

              </div>              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>                <div>

                  <label className="block text-gray-300 mb-2">Waktu Mulai*</label>                  <label className="block text-gray-300 mb-2">Waktu Mulai*</label>

                  <input                  <input

                    type="time"                    type="time"

                    value={formData.startTime}                    value={formData.startTime}

                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}

                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"

                    required                    required

                  />                  />

                </div>                </div>

                <div>                <div>

                  <label className="block text-gray-300 mb-2">Waktu Selesai*</label>                  <label className="block text-gray-300 mb-2">Waktu Selesai*</label>

                  <input                  <input

                    type="time"                    type="time"

                    value={formData.endTime}                    value={formData.endTime}

                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}

                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"

                    required                    required

                  />                  />

                </div>                </div>

              </div>              </div>



              <div>              <div>

                <label className="block text-gray-300 mb-2">Tanggal*</label>                <label className="block text-gray-300 mb-2">Tanggal*</label>

                <input                <input

                  type="date"                  type="date"

                  value={formData.date}                  value={formData.date}

                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}

                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"

                  required                  required

                />                />

              </div>              </div>



              <div>              <div>

                <label className="block text-gray-300 mb-2">Lokasi*</label>                <label className="block text-gray-300 mb-2">Lokasi*</label>

                <input                <input

                  type="text"                  type="text"

                  value={formData.location}                  value={formData.location}

                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}

                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"

                  required                  required

                />                />

              </div>              </div>



              <div>              <div>

                <label className="block text-gray-300 mb-2">Pembicara*</label>                <label className="block text-gray-300 mb-2">Pembicara*</label>

                <input                <input

                  type="text"                  type="text"

                  value={formData.speaker}                  value={formData.speaker}

                  onChange={(e) => setFormData(prev => ({ ...prev, speaker: e.target.value }))}                  onChange={(e) => setFormData(prev => ({ ...prev, speaker: e.target.value }))}

                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"

                  required                  required

                />                />

              </div>              </div>



              <div className="flex items-center gap-2">              <div className="flex items-center gap-2">

                <input                <input

                  type="checkbox"                  type="checkbox"

                  id="is_active"                  id="is_active"

                  checked={formData.is_active}                  checked={formData.is_active}

                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}

                  className="rounded"                  className="rounded"

                />                />

                <label htmlFor="is_active" className="text-gray-300">Aktif</label>                <label htmlFor="is_active" className="text-gray-300">Aktif</label>

              </div>              </div>



              <div className="flex gap-4 pt-4">              <div className="flex gap-4 pt-4">

                <button                <button

                  type="submit"                  type="submit"

                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-2 px-4 rounded-lg"                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-2 px-4 rounded-lg"

                >                >

                  {editingAgenda ? 'Perbarui' : 'Simpan'}                  {editingAgenda ? 'Perbarui' : 'Simpan'}

                </button>                </button>

                <button                <button

                  type="button"                  type="button"

                  onClick={() => setIsDialogOpen(false)}                  onClick={() => setIsDialogOpen(false)}

                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"

                >                >

                  Batal                  Batal

                </button>                </button>

              </div>              </div>

            </form>            </form>

          </div>          </div>

        </div>        </div>

      )}      )}

    </div>    </div>

  );  );

};};



export default AgendaManagement;export default AgendaManagement;
}

const AgendaManagement: React.FC = () => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    date: '',
    location: '',
    speaker: '',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAgendas();
  }, []);

  const fetchAgendas = async () => {
    try {
      console.log('📋 Fetching agendas...');
      setLoading(true);
      setError(null);

      const response = await fetch('/api/agendas');
      const data = await response.json();

      if (Array.isArray(data)) {
        console.log(`✅ Found ${data.length} agenda items`);
        setAgendaItems(data);
      } else {
        console.error('❌ Unexpected response format:', data);
        setError('Format response tidak valid');
      }
    } catch (error) {
      console.error('❌ Error fetching agendas:', error);
      setError('Gagal memuat agenda');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      date: '',
      location: '',
      speaker: '',
      is_active: true
    });
    setEditingItem(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: AgendaItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      startTime: item.start_time,
      endTime: item.end_time,
      date: item.agenda_date,
      location: item.location,
      speaker: item.speaker,
      is_active: Boolean(item.is_active)
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime || !formData.date) {
      alert('Judul, waktu mulai, waktu selesai, dan tanggal wajib diisi!');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`📝 ${editingItem ? 'Updating' : 'Creating'} agenda...`);

      const url = editingItem 
        ? `/api/agendas/${editingItem.id}`
        : '/api/agendas';

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ Agenda ${editingItem ? 'updated' : 'created'} successfully`);
        setIsDialogOpen(false);
        resetForm();
        await fetchAgendas();
      } else {
        console.error(`❌ Failed to ${editingItem ? 'update' : 'create'} agenda:`, data.error);
        alert(data.error || `Gagal ${editingItem ? 'memperbarui' : 'membuat'} agenda`);
      }
    } catch (error) {
      console.error(`❌ Error ${editingItem ? 'updating' : 'creating'} agenda:`, error);
      alert(`Terjadi kesalahan saat ${editingItem ? 'memperbarui' : 'membuat'} agenda`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: AgendaItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus agenda "${item.title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`🗑️ Deleting agenda ${item.id}...`);

      const response = await fetch(`/api/agendas/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ Agenda ${item.id} deleted successfully`);
        await fetchAgendas();
      } else {
        console.error('❌ Failed to delete agenda:', data.error);
        alert(data.error || 'Gagal menghapus agenda');
      }
    } catch (error) {
      console.error('❌ Error deleting agenda:', error);
      alert('Terjadi kesalahan saat menghapus agenda');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Kelola Agenda</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4">
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Agenda</h1>
          <p className="text-gray-400 mt-1">Kelola jadwal acara dan kegiatan</p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Agenda
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 text-red-200">
          <p>Error: {error}</p>
          <Button onClick={fetchAgendas} className="mt-2 bg-red-600 hover:bg-red-700">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Agenda Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {agendaItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300"
            >
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.is_active 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {item.is_active ? 'Aktif' : 'Nonaktif'}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
              
              {/* Description */}
              {item.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
              )}

              {/* Date & Time */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-yellow-400 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(item.agenda_date)}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
                </div>
                {item.location && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
                {item.speaker && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <User className="w-4 h-4 mr-2" />
                    <span className="truncate">{item.speaker}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => openEditDialog(item)}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(item)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white px-3"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {agendaItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Belum ada agenda</h3>
          <p className="text-gray-500 mb-4">Mulai dengan menambahkan agenda pertama Anda</p>
          <Button 
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Agenda
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Agenda' : 'Tambah Agenda Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Perbarui informasi agenda' : 'Tambahkan agenda baru untuk acara'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Judul Agenda *</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Masukkan judul agenda"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Deskripsi</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Masukkan deskripsi agenda (opsional)"
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Tanggal *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Waktu Mulai *</label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Waktu Selesai *</label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            {/* Location and Speaker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Lokasi</label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Masukkan lokasi (opsional)"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Pembicara</label>
                <Input
                  type="text"
                  value={formData.speaker}
                  onChange={(e) => setFormData(prev => ({ ...prev, speaker: e.target.value }))}
                  placeholder="Masukkan nama pembicara (opsional)"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
              />
              <label htmlFor="is_active" className="text-sm text-white">
                Aktifkan agenda (tampilkan di halaman publik)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                disabled={submitting}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : (editingItem ? 'Perbarui' : 'Simpan')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaManagement;