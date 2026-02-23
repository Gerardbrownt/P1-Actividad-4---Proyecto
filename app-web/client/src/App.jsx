import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, Activity, RefreshCw, Plus, Edit, Trash2, X, CheckCircle, Search, Layers, Users, ArrowRightLeft, FileText, XCircle } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [reporteActual, setReporteActual] = useState(null);
  const [datosReporte, setDatosReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  const [searchProd, setSearchProd] = useState('');
  const [filterMov, setFilterMov] = useState({ tipo: '', fecha: '', producto_id: '' });
  
  const [fechasReporte, setFechasReporte] = useState({ 
    fecha_inicio: new Date().toISOString().split('T')[0], 
    fecha_fin: new Date().toISOString().split('T')[0] 
  });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

  const [formData, setFormData] = useState({});

  const initForms = {
    productos: { nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: '', categoria_id: '', proveedor_id: '' },
    categorias: { nombre: '', descripcion: '' },
    proveedores: { nombre: '', contacto: '', telefono: '', email: '', direccion: '' },
    movimientos: { producto_id: '', tipo: 'entrada', cantidad: '', proveedor_id: '', motivo: '', observacion: '' }
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ visible: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 4000);
  };

  const obtenerDatos = async () => {
    setCargando(true);
    try {
      const [resProd, resCat, resProv, resMov] = await Promise.all([
        axios.get('/api/productos'), axios.get('/api/categorias'),
        axios.get('/api/proveedores'), axios.get('/api/movimientos')
      ]);
      setProductos(resProd.data); setCategorias(resCat.data);
      setProveedores(resProv.data); setMovimientos(resMov.data);
      if (activeTab === 'reportes' && reporteActual) cargarReporte(reporteActual);
    } catch (err) {
      mostrarNotificacion("Error: " + (err.response?.data?.error || err.message), 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { obtenerDatos(); }, [activeTab]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const abrirModal = (item = null) => {
    if (item) {
      setEditandoId(item.id);
      setFormData(item);
    } else {
      setEditandoId(null);
      setFormData(initForms[activeTab]);
    }
    setModalAbierto(true);
  };

  const guardarRegistro = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'movimientos') {
        await axios.post('/api/movimientos', formData);
        mostrarNotificacion('Movimiento registrado. Stock actualizado.');
      } else {
        if (editandoId) {
          await axios.put(`/api/${activeTab}/${editandoId}`, formData);
          mostrarNotificacion('Registro actualizado exitosamente.');
        } else {
          await axios.post(`/api/${activeTab}`, formData);
          mostrarNotificacion('Registro creado con éxito.');
        }
      }
      setModalAbierto(false);
      obtenerDatos();
    } catch (err) {
      mostrarNotificacion("Error al guardar: " + (err.response?.data?.error || err.message), 'error');
    }
  };

  const confirmarEliminacion = async () => {
    if (!itemAEliminar) return;
    try {
      await axios.delete(`/api/${activeTab}/${itemAEliminar.id}`);
      mostrarNotificacion('Registro eliminado correctamente.');
      setItemAEliminar(null);
      obtenerDatos();
    } catch (err) {
      mostrarNotificacion("Error al borrar: " + (err.response?.data?.error || err.message), 'error');
    }
  };

  const cargarReporte = async (endpoint) => {
    setCargando(true);
    setReporteActual(endpoint);
    try {
      let params = {};
      if (endpoint === 'productos-movidos' || endpoint === 'movimientos-por-fecha') {
        params = fechasReporte;
      }
      const res = await axios.get(`/api/reportes/${endpoint}`, { params });
      setDatosReporte(res.data);
    } catch (err) {
      setDatosReporte(null);
      const serverError = err.response?.data?.error || "Error conectando con Máquina 3.";
      mostrarNotificacion(serverError, 'error');
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchProd.toLowerCase()) || 
    (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(searchProd.toLowerCase())) ||
    (p.proveedor_nombre && p.proveedor_nombre.toLowerCase().includes(searchProd.toLowerCase()))
  );

  const movimientosFiltrados = movimientos.filter(m => {
    return (filterMov.tipo ? m.tipo === filterMov.tipo : true) &&
           (filterMov.fecha ? m.fecha.startsWith(filterMov.fecha) : true) &&
           (filterMov.producto_id ? m.producto_id.toString() === filterMov.producto_id.toString() : true);
  });

  const limpiarFiltrosMov = () => setFilterMov({ tipo: '', fecha: '', producto_id: '' });

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans overflow-x-hidden">
      {notificacion.visible && (
        <div className={`fixed top-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold transition-all duration-300 ${notificacion.tipo === 'success' ? 'bg-green-500' : 'bg-red-600'}`}>
          {notificacion.tipo === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          <p className="max-w-[300px]">{notificacion.mensaje}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <nav className="flex flex-col md:flex-row justify-between items-center mb-8 bg-[#1e293b] p-6 rounded-3xl border border-slate-700 shadow-2xl gap-4">
          <div className="flex items-center gap-3">
            <Package size={35} className="text-blue-500" />
            <h1 className="text-3xl font-black tracking-tighter uppercase">Inventario Pro</h1>
          </div>
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-700 w-full md:w-auto overflow-x-auto hide-scrollbar">
            <button onClick={() => setActiveTab('productos')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTab === 'productos' ? 'bg-blue-600' : 'text-slate-400 hover:text-white'}`}><Package size={16}/> Productos</button>
            <button onClick={() => setActiveTab('categorias')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTab === 'categorias' ? 'bg-blue-600' : 'text-slate-400 hover:text-white'}`}><Layers size={16}/> Categorías</button>
            <button onClick={() => setActiveTab('proveedores')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTab === 'proveedores' ? 'bg-blue-600' : 'text-slate-400 hover:text-white'}`}><Users size={16}/> Proveedores</button>
            <button onClick={() => setActiveTab('movimientos')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTab === 'movimientos' ? 'bg-blue-600' : 'text-slate-400 hover:text-white'}`}><ArrowRightLeft size={16}/> Movimientos</button>
            <button onClick={() => {setActiveTab('reportes'); setDatosReporte(null); setReporteActual(null);}} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTab === 'reportes' ? 'bg-blue-600' : 'text-slate-400 hover:text-white'}`}><FileText size={16}/> Reportes (M3)</button>
          </div>
          <div className="flex gap-4">
            <button onClick={obtenerDatos} disabled={cargando} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"><RefreshCw size={20} className={cargando ? 'animate-spin' : ''} /></button>
            {activeTab !== 'reportes' && (
              <button onClick={() => abrirModal()} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"><Plus size={18} /> NUEVO</button>
            )}
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-xl">
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Productos</span>
            <h2 className="text-5xl font-black mt-2">{productos.length}</h2>
          </div>
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-l-4 border-l-red-500 border-slate-700 shadow-xl">
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Stock Crítico</span>
            <h2 className="text-5xl font-black mt-2 text-red-500">
              {productos.filter(p => p.stock <= p.stock_minimo).length}
            </h2>
          </div>
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-l-4 border-l-green-500 border-slate-700 shadow-xl">
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Red Tailscale</span>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
              <span className="text-2xl font-black text-green-400 uppercase italic">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-3xl border border-slate-700 overflow-hidden shadow-2xl min-h-[500px]">
          <div className="p-6 bg-slate-800/50 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-black text-slate-300 uppercase tracking-tighter flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> PANEL DE {activeTab.toUpperCase()}
            </h3>
            
            {activeTab === 'productos' && (
              <div className="flex items-center bg-[#0f172a] rounded-xl px-4 py-2 border border-slate-700 w-full md:w-1/3">
                <Search size={18} className="text-slate-500 mr-2" />
                <input type="text" placeholder="Buscar producto, categoría o proveedor..." value={searchProd} onChange={(e) => setSearchProd(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
              </div>
            )}

            {activeTab === 'movimientos' && (
              <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                <select value={filterMov.tipo} onChange={(e) => setFilterMov({...filterMov, tipo: e.target.value})} className="bg-[#0f172a] text-sm p-2 rounded-lg border border-slate-700 outline-none">
                  <option value="">Todos los tipos</option><option value="entrada">Entradas</option><option value="salida">Salidas</option>
                </select>
                <input type="date" value={filterMov.fecha} onChange={(e) => setFilterMov({...filterMov, fecha: e.target.value})} className="bg-[#0f172a] text-sm p-2 rounded-lg border border-slate-700 outline-none [color-scheme:dark]" />
                <select value={filterMov.producto_id} onChange={(e) => setFilterMov({...filterMov, producto_id: e.target.value})} className="bg-[#0f172a] text-sm p-2 rounded-lg border border-slate-700 outline-none max-w-[150px]">
                  <option value="">Todos los productos</option>{productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <button onClick={limpiarFiltrosMov} className="p-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"><XCircle size={14}/> Limpiar</button>
              </div>
            )}

            {activeTab === 'reportes' && (
              <div className="flex flex-wrap gap-2 items-center">
                {(reporteActual === 'productos-movidos' || reporteActual === 'movimientos-por-fecha') && (
                  <div className="flex items-center gap-2 mr-4 bg-[#0f172a] p-1 rounded-xl border border-slate-700">
                    <input type="date" value={fechasReporte.fecha_inicio} onChange={(e) => setFechasReporte({...fechasReporte, fecha_inicio: e.target.value})} className="bg-transparent text-sm p-1 outline-none [color-scheme:dark]" />
                    <span className="text-slate-500 font-bold">-</span>
                    <input type="date" value={fechasReporte.fecha_fin} onChange={(e) => setFechasReporte({...fechasReporte, fecha_fin: e.target.value})} className="bg-transparent text-sm p-1 outline-none [color-scheme:dark]" />
                    <button onClick={() => cargarReporte(reporteActual)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ml-1"><Search size={14}/> Buscar</button>
                  </div>
                )}
                <button onClick={() => cargarReporte('stock-bajo')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${reporteActual === 'stock-bajo' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Stock Bajo</button>
                <button onClick={() => cargarReporte('productos-movidos')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${reporteActual === 'productos-movidos' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Top Movidos</button>
                <button onClick={() => cargarReporte('valor-inventario')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${reporteActual === 'valor-inventario' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Valor Total</button>
                <button onClick={() => cargarReporte('movimientos-por-fecha')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${reporteActual === 'movimientos-por-fecha' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Historial Movs</button>
                <button onClick={() => cargarReporte('resumen-proveedor')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${reporteActual === 'resumen-proveedor' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Resumen Prov.</button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0f172a]/50 text-slate-500 border-b border-slate-700">
                <tr>
                  {activeTab === 'productos' && (
                    <><th className="p-6 text-xs font-black uppercase">Producto</th><th className="p-6 text-xs font-black uppercase text-center">Stock</th><th className="p-6 text-xs font-black uppercase">Precio</th><th className="p-6 text-xs font-black uppercase text-center">Acciones</th></>
                  )}
                  {activeTab === 'categorias' && (
                    <><th className="p-6 text-xs font-black uppercase">Nombre</th><th className="p-6 text-xs font-black uppercase">Descripción</th><th className="p-6 text-xs font-black uppercase text-center">Acciones</th></>
                  )}
                  {activeTab === 'proveedores' && (
                    <><th className="p-6 text-xs font-black uppercase">Proveedor</th><th className="p-6 text-xs font-black uppercase">Contacto</th><th className="p-6 text-xs font-black uppercase text-center">Acciones</th></>
                  )}
                  {activeTab === 'movimientos' && (
                    <><th className="p-6 text-xs font-black uppercase">Fecha</th><th className="p-6 text-xs font-black uppercase">Producto</th><th className="p-6 text-xs font-black uppercase">Tipo</th><th className="p-6 text-xs font-black uppercase">Cantidad</th><th className="p-6 text-xs font-black uppercase">Detalle</th></>
                  )}
                  {activeTab === 'reportes' && datosReporte && Array.isArray(datosReporte) && datosReporte.length > 0 && (
                    Object.keys(datosReporte[0]).map(key => <th key={key} className="p-6 text-xs font-black uppercase">{key.replace(/_/g, ' ')}</th>)
                  )}
                  {activeTab === 'reportes' && datosReporte && !Array.isArray(datosReporte) && datosReporte.categorias && (
                     <><th className="p-6 text-xs font-black uppercase">Categoría</th><th className="p-6 text-xs font-black uppercase">Total Productos</th><th className="p-6 text-xs font-black uppercase">Valor Total</th></>
                  )}
                  {activeTab === 'reportes' && datosReporte && !Array.isArray(datosReporte) && datosReporte.movimientos && (
                     <><th className="p-6 text-xs font-black uppercase">ID</th><th className="p-6 text-xs font-black uppercase">Producto</th><th className="p-6 text-xs font-black uppercase">Tipo</th><th className="p-6 text-xs font-black uppercase">Cantidad</th><th className="p-6 text-xs font-black uppercase">Fecha</th><th className="p-6 text-xs font-black uppercase">Observación</th></>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {activeTab === 'productos' && productosFiltrados.map((p, i) => (
                  <tr key={p.id} className={i === 0 ? 'bg-blue-500/10' : 'hover:bg-blue-500/5'}>
                    <td className="p-6"><div className="font-bold text-lg">{p.nombre} {i===0 && <span className="bg-blue-600 text-[9px] px-2 py-0.5 rounded-md ml-2">NUEVO</span>}</div><div className="text-xs text-slate-500 uppercase">{p.categoria_nombre} | {p.proveedor_nombre}</div></td>
                    <td className="p-6 text-center font-black text-xl"><span className={p.stock <= p.stock_minimo ? 'text-red-500' : 'text-blue-400'}>{p.stock}</span> {p.stock <= p.stock_minimo && <AlertTriangle size={14} className="inline text-red-500 ml-1"/>}</td>
                    <td className="p-6 font-mono">${Number(p.precio).toFixed(2)}</td>
                    <td className="p-6"><div className="flex justify-center gap-2"><button onClick={() => abrirModal(p)} className="p-2 bg-slate-800 text-blue-400 rounded-xl"><Edit size={18} /></button><button onClick={() => setItemAEliminar(p)} className="p-2 bg-slate-800 text-red-400 rounded-xl"><Trash2 size={18} /></button></div></td>
                  </tr>
                ))}
                
                {activeTab === 'categorias' && categorias.map((c, i) => (
                  <tr key={c.id} className={i === 0 ? 'bg-blue-500/10' : 'hover:bg-blue-500/5'}>
                    <td className="p-6 font-bold text-lg">{c.nombre}</td><td className="p-6 text-slate-400">{c.descripcion}</td>
                    <td className="p-6"><div className="flex justify-center gap-2"><button onClick={() => abrirModal(c)} className="p-2 bg-slate-800 text-blue-400 rounded-xl"><Edit size={18} /></button><button onClick={() => setItemAEliminar(c)} className="p-2 bg-slate-800 text-red-400 rounded-xl"><Trash2 size={18} /></button></div></td>
                  </tr>
                ))}

                {activeTab === 'proveedores' && proveedores.map((pv, i) => (
                  <tr key={pv.id} className={i === 0 ? 'bg-blue-500/10' : 'hover:bg-blue-500/5'}>
                    <td className="p-6 font-bold text-lg">{pv.nombre}</td><td className="p-6"><div className="text-slate-300">{pv.contacto}</div><div className="text-xs text-slate-500">{pv.email} | {pv.telefono}</div></td>
                    <td className="p-6"><div className="flex justify-center gap-2"><button onClick={() => abrirModal(pv)} className="p-2 bg-slate-800 text-blue-400 rounded-xl"><Edit size={18} /></button><button onClick={() => setItemAEliminar(pv)} className="p-2 bg-slate-800 text-red-400 rounded-xl"><Trash2 size={18} /></button></div></td>
                  </tr>
                ))}

                {activeTab === 'movimientos' && movimientosFiltrados.map((m, i) => (
                  <tr key={m.id} className={i === 0 ? 'bg-blue-500/10' : 'hover:bg-blue-500/5'}>
                    <td className="p-6 text-sm text-slate-400">{new Date(m.fecha).toLocaleString()}</td>
                    <td className="p-6 font-bold">{m.producto_nombre}</td>
                    <td className="p-6"><span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${m.tipo === 'entrada' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{m.tipo}</span></td>
                    <td className="p-6 font-black text-xl">{m.cantidad}</td>
                    <td className="p-6 text-sm text-slate-400">{m.tipo === 'entrada' ? `Prov: ${m.proveedor_nombre || '-'}` : `Motivo: ${m.motivo || '-'}`}<br/><span className="text-xs italic">{m.observacion}</span></td>
                  </tr>
                ))}

                {activeTab === 'reportes' && datosReporte && Array.isArray(datosReporte) && datosReporte.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-500/5">
                    {Object.values(row).map((val, idx) => <td key={idx} className="p-6">{val}</td>)}
                  </tr>
                ))}

                {activeTab === 'reportes' && datosReporte && !Array.isArray(datosReporte) && datosReporte.categorias && datosReporte.categorias.map((row, i) => (
                   <tr key={i} className="hover:bg-blue-500/5">
                     <td className="p-6 font-bold">{row.categoria}</td>
                     <td className="p-6">{row.total_productos}</td>
                     <td className="p-6 font-mono">${Number(row.valor_total).toFixed(2)}</td>
                   </tr>
                ))}
                
                {activeTab === 'reportes' && datosReporte && !Array.isArray(datosReporte) && datosReporte.movimientos && datosReporte.movimientos.map((row, i) => (
                   <tr key={i} className="hover:bg-blue-500/5">
                     {Object.values(row).map((val, idx) => <td key={idx} className="p-6">{idx === 4 ? new Date(val).toLocaleString() : val}</td>)}
                   </tr>
                ))}
                
                {activeTab === 'reportes' && !datosReporte && !cargando && (
                  <tr><td colSpan="10" className="p-10 text-center text-slate-500">Selecciona un reporte arriba para ver los datos.</td></tr>
                )}
              </tbody>
            </table>
            
            {activeTab === 'reportes' && datosReporte && !Array.isArray(datosReporte) && datosReporte.valor_total_inventario && (
              <div className="p-6 bg-slate-800 text-right border-t border-slate-700">
                <span className="text-slate-400 uppercase font-black mr-4">Valor Total del Inventario:</span>
                <span className="text-2xl font-black text-blue-400">${Number(datosReporte.valor_total_inventario).toFixed(2)}</span>
              </div>
            )}
            {activeTab === 'reportes' && datosReporte && !Array.isArray(datosReporte) && datosReporte.totales && (
              <div className="p-6 bg-slate-800 flex justify-end gap-6 border-t border-slate-700">
                <div><span className="text-slate-400 uppercase font-black mr-2">Total Entradas:</span><span className="text-xl font-black text-green-400">{datosReporte.totales.entradas}</span></div>
                <div><span className="text-slate-400 uppercase font-black mr-2">Total Salidas:</span><span className="text-xl font-black text-red-400">{datosReporte.totales.salidas}</span></div>
              </div>
            )}

          </div>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 w-full max-w-2xl relative">
            <button onClick={() => setModalAbierto(false)} className="absolute top-6 right-6 text-slate-400"><X size={24} /></button>
            <h2 className="text-2xl font-black uppercase mb-6">{editandoId ? 'EDITAR' : 'NUEVO'} {activeTab.slice(0,-1).toUpperCase()}</h2>
            <form onSubmit={guardarRegistro} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {activeTab === 'productos' && (
                <>
                  <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre" className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <input required type="text" name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Descripción" className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <input required type="number" step="0.01" name="precio" value={formData.precio} onChange={handleInputChange} placeholder="Precio Unitario" className="p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Stock Actual" className="p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <input required type="number" name="stock_minimo" value={formData.stock_minimo} onChange={handleInputChange} placeholder="Stock Mínimo" className="p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <select required name="categoria_id" value={formData.categoria_id} onChange={handleInputChange} className="p-3 bg-[#0f172a] rounded-xl outline-none">
                    <option value="">Categoría...</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <select required name="proveedor_id" value={formData.proveedor_id} onChange={handleInputChange} className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none">
                    <option value="">Proveedor...</option>{proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </>
              )}

              {activeTab === 'categorias' && (
                <>
                  <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre Categoría" className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <input required type="text" name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Descripción" className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none" />
                </>
              )}

              {activeTab === 'proveedores' && (
                <>
                  <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre Proveedor" className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <input required type="text" name="contacto" value={formData.contacto} onChange={handleInputChange} placeholder="Persona Contacto" className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <input required type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Teléfono" className="p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="p-3 bg-[#0f172a] rounded-xl outline-none" />
                  <input required type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Dirección" className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none" />
                </>
              )}

              {activeTab === 'movimientos' && (
                <>
                  <select required name="tipo" value={formData.tipo} onChange={handleInputChange} className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none font-bold text-blue-400">
                    <option value="entrada">ENTRADA (Compra/Reposición)</option>
                    <option value="salida">SALIDA (Venta/Despacho)</option>
                  </select>
                  <select required name="producto_id" value={formData.producto_id} onChange={handleInputChange} className="p-3 bg-[#0f172a] rounded-xl outline-none">
                    <option value="">Seleccionar Producto...</option>{productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>)}
                  </select>
                  <input required type="number" min="1" name="cantidad" value={formData.cantidad} onChange={handleInputChange} placeholder="Cantidad" className="p-3 bg-[#0f172a] rounded-xl outline-none font-black text-center" />
                  
                  {formData.tipo === 'entrada' ? (
                    <select required name="proveedor_id" value={formData.proveedor_id} onChange={handleInputChange} className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none">
                      <option value="">Proveedor de la entrada...</option>{proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  ) : (
                    <input required type="text" name="motivo" value={formData.motivo} onChange={handleInputChange} placeholder="Motivo de salida (Ej. Venta #123)" className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none" />
                  )}
                  <input type="text" name="observacion" value={formData.observacion} onChange={handleInputChange} placeholder="Observaciones (Opcional)" className="col-span-2 p-3 bg-[#0f172a] rounded-xl outline-none" />
                </>
              )}

              <div className="col-span-2 mt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-6 py-3 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-colors">CANCELAR</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors">GUARDAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemAEliminar && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-red-500/50 w-full max-w-md text-center">
            <AlertTriangle size={50} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black uppercase mb-2">¿Eliminar Registro?</h2>
            <p className="text-slate-400 mb-6">Se borrará permanentemente "{itemAEliminar.nombre || itemAEliminar.id}".</p>
            <div className="flex gap-4">
              <button onClick={() => setItemAEliminar(null)} className="flex-1 p-4 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-colors">CANCELAR</button>
              <button onClick={confirmarEliminacion} className="flex-1 p-4 bg-red-600 rounded-xl font-bold hover:bg-red-500 transition-colors">ELIMINAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;