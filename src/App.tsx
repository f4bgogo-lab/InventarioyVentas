import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Terminal,
  RefreshCw,
  Play,
  Square,
  FileText,
  CheckCircle2,
  DollarSign,
  Award,
  Search,
  ArrowRight,
  ChevronRight,
  Info,
  Layers,
  X
} from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number;
}

interface Venta {
  id_venta: number;
  id_producto: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "terminal">("dashboard");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState("");
  const [terminalInput, setTerminalInput] = useState("");
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  
  // Modals / forms state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  
  // Form fields
  const [addId, setAddId] = useState("");
  const [addNombre, setAddNombre] = useState("");
  const [addStockActual, setAddStockActual] = useState("");
  const [addStockMinimo, setAddStockMinimo] = useState("");
  const [addPrecioVenta, setAddPrecioVenta] = useState("");
  
  const [editNombre, setEditNombre] = useState("");
  const [editStockActual, setEditStockActual] = useState("");
  const [editStockMinimo, setEditStockMinimo] = useState("");
  const [editPrecioVenta, setEditPrecioVenta] = useState("");
  
  const [sellCantidad, setSellCantidad] = useState("1");

  // Fetch initial data
  useEffect(() => {
    fetchProductos();
    fetchVentas();
  }, []);

  // Poll terminal logs if active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTerminalRunning) {
      interval = setInterval(() => {
        fetchTerminalLogs();
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isTerminalRunning]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/productos");
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const fetchVentas = async () => {
    try {
      const res = await fetch("/api/ventas");
      if (res.ok) {
        const data = await res.json();
        setVentas(data);
      }
    } catch (err) {
      console.error("Error fetching sales", err);
    }
  };

  // Create Product
  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!addId.trim() || !addNombre.trim() || !addStockActual || !addStockMinimo || !addPrecioVenta) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }

    if (isNaN(Number(addStockActual)) || isNaN(Number(addStockMinimo)) || isNaN(Number(addPrecioVenta))) {
      setFormError("Stock y Precio deben ser valores numéricos válidos.");
      return;
    }

    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addId.trim().toUpperCase(),
          nombre: addNombre.trim(),
          stock_actual: parseInt(addStockActual),
          stock_minimo: parseInt(addStockMinimo),
          precio_venta: parseFloat(addPrecioVenta)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Error al añadir producto.");
      } else {
        setFormSuccess(`¡Producto ${data.nombre} añadido correctamente!`);
        fetchProductos();
        // Reset form
        setAddId("");
        setAddNombre("");
        setAddStockActual("");
        setAddStockMinimo("");
        setAddPrecioVenta("");
        setTimeout(() => {
          setIsAddOpen(false);
          setFormSuccess("");
        }, 1500);
      }
    } catch (err) {
      setFormError("Error de conexión con el servidor.");
    }
  };

  // Edit Product
  const handleEditProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProducto) return;
    setFormError("");
    setFormSuccess("");

    if (!editNombre.trim() || !editStockActual || !editStockMinimo || !editPrecioVenta) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }

    if (isNaN(Number(editStockActual)) || isNaN(Number(editStockMinimo)) || isNaN(Number(editPrecioVenta))) {
      setFormError("Stock y Precio deben ser valores numéricos válidos.");
      return;
    }

    try {
      const res = await fetch(`/api/productos/${selectedProducto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          stock_actual: parseInt(editStockActual),
          stock_minimo: parseInt(editStockMinimo),
          precio_venta: parseFloat(editPrecioVenta)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Error al actualizar producto.");
      } else {
        setFormSuccess(`¡Producto actualizado correctamente!`);
        fetchProductos();
        setTimeout(() => {
          setIsEditOpen(false);
          setFormSuccess("");
        }, 1200);
      }
    } catch (err) {
      setFormError("Error de conexión con el servidor.");
    }
  };

  // Register Sale
  const handleRegisterSale = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProducto) return;
    setFormError("");
    setFormSuccess("");

    const cant = parseInt(sellCantidad);
    if (isNaN(cant) || cant <= 0) {
      setFormError("La cantidad debe ser un entero mayor a cero.");
      return;
    }

    if (cant > selectedProducto.stock_actual) {
      setFormError("Stock insuficiente para completar la venta.");
      return;
    }

    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_producto: selectedProducto.id,
          cantidad: cant
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Error al registrar la venta.");
      } else {
        setFormSuccess(`¡Venta registrada con éxito! Total: S/. ${data.total.toFixed(2)}`);
        fetchProductos();
        fetchVentas();
        setSellCantidad("1");
        setTimeout(() => {
          setIsSellOpen(false);
          setFormSuccess("");
        }, 1500);
      }
    } catch (err) {
      setFormError("Error de conexión con el servidor.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar el producto ${id}?`)) return;
    try {
      const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProductos();
      } else {
        const data = await res.json();
        alert(data.error || "No se pudo eliminar el producto.");
      }
    } catch (err) {
      alert("Error al comunicarse con el servidor.");
    }
  };

  // Terminal API integrations
  const startTerminal = async () => {
    try {
      const res = await fetch("/api/terminal/start", { method: "POST" });
      if (res.ok) {
        setIsTerminalRunning(true);
        fetchTerminalLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTerminalLogs = async () => {
    try {
      const res = await fetch("/api/terminal/logs");
      if (res.ok) {
        const data = await res.json();
        setTerminalLogs(data.logs);
        setIsTerminalRunning(data.isRunning);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendTerminalInput = async (e: FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    const inputToSend = terminalInput;
    setTerminalInput("");
    
    try {
      await fetch("/api/terminal/input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: inputToSend })
      });
      fetchTerminalLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const stopTerminal = async () => {
    try {
      await fetch("/api/terminal/stop", { method: "POST" });
      setIsTerminalRunning(false);
      fetchTerminalLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const clearTerminalLogs = () => {
    setTerminalLogs("=== CONSOLA LIMPIA ===\nPulse 'Iniciar Consola' para arrancar el CLI de Python.\n");
  };

  // Open forms with initial values
  const openEdit = (p: Producto) => {
    setSelectedProducto(p);
    setEditNombre(p.nombre);
    setEditStockActual(p.stock_actual.toString());
    setEditStockMinimo(p.stock_minimo.toString());
    setEditPrecioVenta(p.precio_venta.toString());
    setFormError("");
    setFormSuccess("");
    setIsEditOpen(true);
  };

  const openSell = (p: Producto) => {
    setSelectedProducto(p);
    setSellCantidad("1");
    setFormError("");
    setFormSuccess("");
    setIsSellOpen(true);
  };

  // Metrics
  const totalInversión = productos.reduce((sum, p) => sum + p.stock_actual * p.precio_venta, 0);
  const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);
  const totalUnidadesVendidas = ventas.reduce((sum, v) => sum + v.cantidad, 0);
  const productosCriticos = productos.filter((p) => p.stock_actual <= p.stock_minimo);

  // Filtered list
  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate Star Product
  const starProduct = () => {
    if (!ventas.length) return "N/A";
    const counts: { [key: string]: number } = {};
    ventas.forEach((v) => {
      counts[v.nombre] = (counts[v.nombre] || 0) + v.cantidad;
    });
    let maxQty = 0;
    let star = "N/A";
    Object.keys(counts).forEach((name) => {
      if (counts[name] > maxQty) {
        maxQty = counts[name];
        star = name;
      }
    });
    return `${star} (${maxQty} uds)`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-slate-200 selection:text-slate-900">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 text-white p-2.5 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                Inventario & Ventas
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Módulo Administrativo y CLI Python
              </p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Dashboard Visual</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("terminal");
                // Start terminal right away if not running to make it immediately operational
                if (!isTerminalRunning) startTerminal();
              }}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "terminal"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Terminal className="h-4 w-4" />
              <span>Consola Python CLI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Info Notification */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start space-x-3 shadow-xs">
          <Info className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Diseño Unificado de Datos:</span> Este sistema comparte la misma base de datos en tiempo real (<code>datos/productos.json</code> y <code>datos/ventas.json</code>) entre el Dashboard Visual y la consola interactiva de Python. Las operaciones que realices en el dashboard se reflejarán instantáneamente si ejecutas el script Python, y viceversa.
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* KPI Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                
                {/* Total Valor Inventario */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase block">
                      Valorización del Stock
                    </span>
                    <span className="text-2xl font-bold text-slate-900 block mt-1">
                      S/. {totalInversión.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">
                      {productos.length} productos registrados
                    </span>
                  </div>
                  <div className="bg-slate-100 text-slate-900 p-3 rounded-xl">
                    <Package className="h-6 w-6" />
                  </div>
                </div>

                {/* Ingresos por Ventas */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase block">
                      Ingresos Totales
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 block mt-1">
                      S/. {totalIngresos.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">
                      {totalUnidadesVendidas} unidades vendidas
                    </span>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>

                {/* Stock Crítico */}
                <div className={`bg-white p-5 rounded-xl border shadow-xs flex items-center justify-between transition-colors duration-300 ${
                  productosCriticos.length > 0 ? "border-amber-300 bg-amber-50/20" : "border-slate-200"
                }`}>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase block">
                      Stock Crítico
                    </span>
                    <span className={`text-2xl font-bold block mt-1 ${
                      productosCriticos.length > 0 ? "text-amber-600" : "text-slate-900"
                    }`}>
                      {productosCriticos.length} Alertas
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">
                      Rebasa el stock mínimo
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    productosCriticos.length > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </div>

                {/* Producto Estrella */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase block">
                      Producto Estrella ⭐
                    </span>
                    <span className="text-lg font-bold text-slate-900 block mt-1 line-clamp-1">
                      {starProduct().split(" (")[0]}
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">
                      {starProduct().includes("(") ? `Mas vendido: ${starProduct().split(" (")[1].replace(")", "")}` : "Sin ventas registradas"}
                    </span>
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                    <Award className="h-6 w-6" />
                  </div>
                </div>

              </div>

              {/* Main Visual Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Product Catalog */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
                  
                  {/* Header & Controls */}
                  <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Catálogo de Productos</h2>
                      <p className="text-xs text-slate-500 font-medium">Visualización de niveles de inventario en tiempo real</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Search */}
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Search className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="Buscar por ID o nombre..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-1.5 w-full sm:w-60 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                      
                      {/* Add Button */}
                      <button
                        onClick={() => {
                          setFormError("");
                          setFormSuccess("");
                          setIsAddOpen(true);
                        }}
                        className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>

                  {/* Table area */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                          <th className="py-3 px-5">ID/Código</th>
                          <th className="py-3 px-5">Nombre del Producto</th>
                          <th className="py-3 px-5 text-right">Precio Venta</th>
                          <th className="py-3 px-5 text-right">Stock Actual</th>
                          <th className="py-3 px-5 text-right">Stock Mínimo</th>
                          <th className="py-3 px-5 text-center">Estado</th>
                          <th className="py-3 px-5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {filteredProductos.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400 font-normal">
                              No se encontraron productos en el inventario.
                            </td>
                          </tr>
                        ) : (
                          filteredProductos.map((p) => {
                            const isCritico = p.stock_actual <= p.stock_minimo;
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3.5 px-5 font-mono text-slate-500 font-semibold">
                                  {p.id}
                                </td>
                                <td className="py-3.5 px-5 font-bold text-slate-900">
                                  {p.nombre}
                                </td>
                                <td className="py-3.5 px-5 text-right font-mono text-slate-600">
                                  S/. {p.precio_venta.toFixed(2)}
                                </td>
                                <td className="py-3.5 px-5 text-right font-mono">
                                  <span className={isCritico ? "text-amber-600 font-bold" : "text-slate-900"}>
                                    {p.stock_actual}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-right font-mono text-slate-400">
                                  {p.stock_minimo}
                                </td>
                                <td className="py-3.5 px-5 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                                    isCritico 
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}>
                                    {isCritico ? "BAJO STOCK" : "OK"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <button
                                      onClick={() => openSell(p)}
                                      disabled={p.stock_actual <= 0}
                                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                        p.stock_actual <= 0
                                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                      }`}
                                    >
                                      Vender
                                    </button>
                                    <button
                                      onClick={() => openEdit(p)}
                                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all"
                                      title="Editar Producto"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Sidebar widgets */}
                <div className="flex flex-col space-y-6">
                  
                  {/* Critical Stock Alert widget */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Módulo de Alertas</h3>
                        <p className="text-[11px] text-slate-400">Items bajo stock de reordenamiento</p>
                      </div>
                      <AlertTriangle className={`h-4.5 w-4.5 ${productosCriticos.length > 0 ? "text-amber-500 animate-pulse" : "text-slate-400"}`} />
                    </div>

                    <div className="pt-4 space-y-3.5">
                      {productosCriticos.length === 0 ? (
                        <div className="text-center py-6">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 font-medium">Auditoría del Stock: Óptimo</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Todos los productos tienen niveles seguros.</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs leading-normal">
                            ⚠️ Hay <span className="font-bold">{productosCriticos.length}</span> producto(s) que requieren reabastecimiento crítico.
                          </div>
                          
                          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                            {productosCriticos.map((p) => (
                              <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-xs">
                                <div>
                                  <p className="font-bold text-slate-900">{p.nombre}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {p.id} | Mín: {p.stock_minimo}</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-amber-600 font-bold block">{p.stock_actual} uds</span>
                                  <span className="text-[10px] text-red-500 font-semibold block mt-0.5">Crítico</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sales History Summary */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Historial Reciente</h3>
                        <p className="text-[11px] text-slate-400">Últimas transacciones registradas</p>
                      </div>
                      <ShoppingCart className="h-4.5 w-4.5 text-slate-400" />
                    </div>

                    <div className="pt-4 flex-1 overflow-y-auto space-y-3 pr-1 max-h-80">
                      {ventas.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-normal text-xs">
                          Ninguna venta registrada todavía.
                        </div>
                      ) : (
                        [...ventas].reverse().slice(0, 10).map((v) => (
                          <div key={v.id_venta} className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-lg text-xs transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 truncate max-w-[170px]">{v.nombre}</span>
                              <span className="font-mono text-emerald-600 font-bold">S/. {v.total.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-medium">
                              <span>Cant: {v.cantidad} x S/. {v.precio_unitario.toFixed(2)}</span>
                              <span className="font-mono text-slate-400 font-semibold">Boleta #{v.id_venta}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          ) : (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* Terminal View Container */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Information and code visualizer */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* CLI Controller Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Panel de Control Python</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Ejecuta el script interactivo console-based en Python tal cual como fue especificado. El servidor de Node levantará un proceso secundario que se comunica vía streams estándares.
                    </p>
                    
                    <div className="space-y-3">
                      {!isTerminalRunning ? (
                        <button
                          onClick={startTerminal}
                          className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 fill-white" />
                          <span>Iniciar Consola Python</span>
                        </button>
                      ) : (
                        <button
                          onClick={stopTerminal}
                          className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Square className="h-3.5 w-3.5 fill-white" />
                          <span>Detener Consola (SIGINT)</span>
                        </button>
                      )}

                      <button
                        onClick={clearTerminalLogs}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg text-xs font-semibold transition-all"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Limpiar Pantalla</span>
                      </button>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${isTerminalRunning ? "bg-emerald-500 animate-ping" : "bg-slate-300"}`} />
                        <span className="text-xs font-bold text-slate-700">
                          Estado: {isTerminalRunning ? "EJECUTÁNDOSE (python3)" : "INACTIVO"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Instructions Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Guía de Comandos CLI</h3>
                    <ul className="space-y-2 text-xs text-slate-600 font-medium">
                      <li className="flex items-start space-x-2">
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">1</span>
                        <span>Registrar una venta (solicitará Código y Cantidad).</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">2</span>
                        <span>Mostrar el historial de ventas completo.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">3</span>
                        <span>Verificar alertas críticas corporativas.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">4</span>
                        <span>Ver reporte de ingresos acumulados.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">5</span>
                        <span>Calcular el Producto Estrella más vendido.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">6</span>
                        <span>Listar productos por reabastecer.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">7</span>
                        <span>Cerrar de forma segura el programa.</span>
                      </li>
                    </ul>
                  </div>

                </div>

                {/* Shell emulator */}
                <div className="lg:col-span-3">
                  <div className="bg-[#0f172a] rounded-xl overflow-hidden shadow-xl border border-slate-800 flex flex-col h-[520px]">
                    {/* Header of shell */}
                    <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                          <span className="w-3 h-3 rounded-full bg-green-500/80 block" />
                        </div>
                        <span className="text-xs text-slate-400 font-mono pl-2">bash - python3 main.py</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">TTY: pts/0</span>
                    </div>

                    {/* Output logs screen */}
                    <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-1 selection:bg-slate-700 selection:text-white">
                      {terminalLogs ? (
                        <pre className="whitespace-pre-wrap font-mono">{terminalLogs}</pre>
                      ) : (
                        <div className="text-slate-500 italic h-full flex flex-col items-center justify-center space-y-2">
                          <Terminal className="h-10 w-10 text-slate-700 animate-pulse" />
                          <p>La consola está vacía.</p>
                          <p className="text-[10px] text-slate-600 not-italic">Presione "Iniciar Consola Python" para arrancar el programa.</p>
                        </div>
                      )}
                      <div ref={terminalBottomRef} />
                    </div>

                    {/* Input form prompt */}
                    <form onSubmit={sendTerminalInput} className="bg-slate-900 border-t border-slate-800 p-3 flex items-center space-x-3">
                      <span className="text-emerald-500 font-mono text-xs font-bold pl-2">guest@aistudio:~$</span>
                      <input
                        type="text"
                        disabled={!isTerminalRunning}
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder={isTerminalRunning ? "Escriba una opción y presione Enter..." : "Inicie la consola para habilitar la entrada..."}
                        className="flex-1 bg-transparent border-0 text-white font-mono text-xs focus:ring-0 focus:outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
                        autoFocus
                      />
                      {isTerminalRunning && (
                        <button
                          type="submit"
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded text-[10px] font-mono font-bold transition-all flex items-center space-x-1"
                        >
                          <span>Enviar</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </form>
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* --- ADD PRODUCT MODAL --- */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden relative z-10"
            >
              <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-sm">Añadir Nuevo Producto</h3>
                </div>
                <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 transition-all p-1 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-semibold">
                    {formError}
                  </div>
                )}
                
                {formSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold">
                    {formSuccess}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">ID / Código</label>
                    <input
                      type="text"
                      placeholder="P005"
                      value={addId}
                      onChange={(e) => setAddId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none placeholder:text-slate-400 font-mono uppercase"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Nombre del Producto</label>
                    <input
                      type="text"
                      placeholder="Auriculares Inalámbricos Sony"
                      value={addNombre}
                      onChange={(e) => setAddNombre(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Precio de Venta (S/.)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="99.90"
                    value={addPrecioVenta}
                    onChange={(e) => setAddPrecioVenta(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none placeholder:text-slate-400 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Stock Inicial</label>
                    <input
                      type="number"
                      placeholder="20"
                      value={addStockActual}
                      onChange={(e) => setAddStockActual(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none placeholder:text-slate-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Stock Mínimo</label>
                    <input
                      type="number"
                      placeholder="5"
                      value={addStockMinimo}
                      onChange={(e) => setAddStockMinimo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    Guardar Producto
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT PRODUCT MODAL --- */}
      <AnimatePresence>
        {isEditOpen && selectedProducto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden relative z-10"
            >
              <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <Edit2 className="h-4.5 w-4.5 text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-sm">Editar Producto: <span className="font-mono text-slate-500 font-semibold">{selectedProducto.id}</span></h3>
                </div>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition-all p-1 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleEditProduct} className="p-6 space-y-4">
                
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-semibold">
                    {formError}
                  </div>
                )}
                
                {formSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold">
                    {formSuccess}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Precio de Venta (S/.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrecioVenta}
                    onChange={(e) => setEditPrecioVenta(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Stock Actual</label>
                    <input
                      type="number"
                      value={editStockActual}
                      onChange={(e) => setEditStockActual(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Stock Mínimo</label>
                    <input
                      type="number"
                      value={editStockMinimo}
                      onChange={(e) => setEditStockMinimo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SELL PRODUCT MODAL (REGISTRAR VENTA) --- */}
      <AnimatePresence>
        {isSellOpen && selectedProducto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSellOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden relative z-10"
            >
              <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4.5 w-4.5 text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-sm">Registrar Nueva Venta</h3>
                </div>
                <button onClick={() => setIsSellOpen(false)} className="text-slate-400 hover:text-slate-600 transition-all p-1 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterSale} className="p-6 space-y-4">
                
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-semibold">
                    {formError}
                  </div>
                )}
                
                {formSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold">
                    {formSuccess}
                  </div>
                )}

                {/* Info about selected item */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Producto:</span>
                    <span className="font-bold text-slate-900 text-right">{selectedProducto.nombre}</span>
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Precio Unitario:</span>
                    <span className="font-mono text-slate-900">S/. {selectedProducto.precio_venta.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Disponibilidad (Stock):</span>
                    <span className={`font-mono font-semibold ${selectedProducto.stock_actual <= selectedProducto.stock_minimo ? "text-amber-600" : "text-slate-700"}`}>
                      {selectedProducto.stock_actual} uds
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Cantidad a Vender</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProducto.stock_actual}
                    value={sellCantidad}
                    onChange={(e) => setSellCantidad(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:outline-none font-mono"
                  />
                </div>

                {/* Total estimation */}
                {!isNaN(parseInt(sellCantidad)) && parseInt(sellCantidad) > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Total a Pagar:</span>
                    <span className="text-base font-bold text-emerald-600 font-mono">
                      S/. {(parseInt(sellCantidad) * selectedProducto.precio_venta).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsSellOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    Completar Venta
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
