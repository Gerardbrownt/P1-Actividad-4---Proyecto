import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpCircle, ArrowDownCircle, AlertTriangle, BarChart3, LayoutDashboard } from 'lucide-react';

function App() {
  const [view, setView] = useState('inventory');
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMovement = async (id, type) => {
    const qty = prompt("Ingrese cantidad:");
    if (!qty) return;
    try {
      await axios.post('/api/movements', {
        product_id: id,
        type: type,
        quantity: parseInt(qty),
        reason: 'Manual Update'
      });
      fetchProducts();
    } catch (error) {
      alert('Error processing movement');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 text-2xl font-bold text-blue-500 tracking-tighter">
          INVENTARIO <span className="text-white">PRO</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setView('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'inventory' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setView('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>
            <BarChart3 size={20} /> Reportes
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">{view === 'inventory' ? 'Gestión de Productos' : 'Reportes del Sistema'}</h1>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-green-400">Sistema Online</span>
          </div>
        </header>

        {view === 'inventory' ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
                <tr><th className="p-4">Producto</th><th className="p-4">Stock</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/30">
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4 font-mono text-lg">{p.stock}</td>
                    <td className="p-4">
                      {p.stock <= p.min_stock ? 
                        <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><AlertTriangle size={12} /> BAJO</span> : 
                        <span className="text-green-400 text-xs font-bold">OPTIMO</span>
                      }
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleMovement(p.id, 'IN')} className="p-2 bg-slate-700 hover:bg-green-600 rounded-lg"><ArrowUpCircle size={18} /></button>
                      <button onClick={() => handleMovement(p.id, 'OUT')} className="p-2 bg-slate-700 hover:bg-red-600 rounded-lg"><ArrowDownCircle size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Reportes Externos (Máquina 3)</h3>
            <p className="text-slate-400">Conectado vía Tailscale.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;