import express from "express";
import path from "path";
import fs from "fs";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
app.use(express.json());

const PORT = 3000;
const PROYECTO_DIR = path.join(process.cwd(), "proyecto_inventario_ventas");
const PRODUCTOS_FILE = path.join(PROYECTO_DIR, "datos", "productos.json");
const VENTAS_FILE = path.join(PROYECTO_DIR, "datos", "ventas.json");

// Helper to ensure folders and files exist
function ensureFilesExist() {
  if (!fs.existsSync(PROYECTO_DIR)) {
    fs.mkdirSync(PROYECTO_DIR, { recursive: true });
  }
  const datosDir = path.join(PROYECTO_DIR, "datos");
  if (!fs.existsSync(datosDir)) {
    fs.mkdirSync(datosDir, { recursive: true });
  }
  if (!fs.existsSync(PRODUCTOS_FILE)) {
    const productosMuestra = [
      { "id": "P001", "nombre": "Laptop Gamer Lenovo", "stock_actual": 15, "stock_minimo": 5, "precio_venta": 1200.00 },
      { "id": "P002", "nombre": "Mouse Óptico Logitech", "stock_actual": 3, "stock_minimo": 10, "precio_venta": 25.50 },
      { "id": "P003", "nombre": "Teclado Mecánico Razer", "stock_actual": 8, "stock_minimo": 5, "precio_venta": 85.00 },
      { "id": "P004", "nombre": "Monitor ASUS 24\" UltraWide", "stock_actual": 2, "stock_minimo": 3, "precio_venta": 180.00 }
    ];
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productosMuestra, null, 4), "utf-8");
  }
  if (!fs.existsSync(VENTAS_FILE)) {
    fs.writeFileSync(VENTAS_FILE, JSON.stringify([], null, 4), "utf-8");
  }
}

ensureFilesExist();

// API: Get products
app.get("/api/productos", (req, res) => {
  try {
    ensureFilesExist();
    const data = fs.readFileSync(PRODUCTOS_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Error al leer productos" });
  }
});

// API: Add product
app.post("/api/productos", (req, res) => {
  try {
    ensureFilesExist();
    const productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE, "utf-8"));
    const nuevo = req.body;
    
    if (!nuevo.id || !nuevo.nombre || nuevo.stock_actual === undefined || nuevo.stock_minimo === undefined || nuevo.precio_venta === undefined) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    
    if (productos.some((p: any) => p.id.toUpperCase() === nuevo.id.toUpperCase())) {
      return res.status(400).json({ error: "Ya existe un producto con este ID/Código" });
    }
    
    const productoObj = {
      id: nuevo.id.toUpperCase(),
      nombre: nuevo.nombre,
      stock_actual: Number(nuevo.stock_actual),
      stock_minimo: Number(nuevo.stock_minimo),
      precio_venta: Number(nuevo.precio_venta)
    };
    
    productos.push(productoObj);
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productos, null, 4), "utf-8");
    res.status(201).json(productoObj);
  } catch (err) {
    res.status(500).json({ error: "Error al guardar producto" });
  }
});

// API: Update product
app.put("/api/productos/:id", (req, res) => {
  try {
    ensureFilesExist();
    const productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE, "utf-8"));
    const id = req.params.id.toUpperCase();
    const index = productos.findIndex((p: any) => p.id.toUpperCase() === id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    const p = productos[index];
    const update = req.body;
    if (update.nombre !== undefined) p.nombre = update.nombre;
    if (update.stock_actual !== undefined) p.stock_actual = Number(update.stock_actual);
    if (update.stock_minimo !== undefined) p.stock_minimo = Number(update.stock_minimo);
    if (update.precio_venta !== undefined) p.precio_venta = Number(update.precio_venta);
    
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productos, null, 4), "utf-8");
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// API: Delete product
app.delete("/api/productos/:id", (req, res) => {
  try {
    ensureFilesExist();
    const productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE, "utf-8"));
    const id = req.params.id.toUpperCase();
    const filtrados = productos.filter((p: any) => p.id.toUpperCase() !== id);
    
    if (productos.length === filtrados.length) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(filtrados, null, 4), "utf-8");
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// API: Get sales history
app.get("/api/ventas", (req, res) => {
  try {
    ensureFilesExist();
    const data = fs.readFileSync(VENTAS_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Error al leer ventas" });
  }
});

// API: Register a sale
app.post("/api/ventas", (req, res) => {
  try {
    ensureFilesExist();
    const productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE, "utf-8"));
    const ventas = JSON.parse(fs.readFileSync(VENTAS_FILE, "utf-8"));
    
    const { id_producto, cantidad } = req.body;
    if (!id_producto || !cantidad) {
      return res.status(400).json({ error: "id_producto y cantidad son requeridos" });
    }
    
    const producto = productos.find((p: any) => p.id.toUpperCase() === id_producto.toUpperCase());
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    const cantNum = Number(cantidad);
    if (isNaN(cantNum) || cantNum <= 0) {
      return res.status(400).json({ error: "Cantidad debe ser un entero mayor a cero" });
    }
    
    if (cantNum > producto.stock_actual) {
      return res.status(400).json({ error: "Stock insuficiente para realizar la venta" });
    }
    
    const total = cantNum * producto.precio_venta;
    producto.stock_actual -= cantNum;
    
    const nuevaVenta = {
      id_venta: ventas.length + 1,
      id_producto: producto.id,
      nombre: producto.nombre,
      cantidad: cantNum,
      precio_unitario: producto.precio_venta,
      total: total
    };
    
    ventas.push(nuevaVenta);
    
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productos, null, 4), "utf-8");
    fs.writeFileSync(VENTAS_FILE, JSON.stringify(ventas, null, 4), "utf-8");
    
    res.status(201).json(nuevaVenta);
  } catch (err) {
    res.status(500).json({ error: "Error al registrar la venta" });
  }
});

// Python interactive terminal controllers
let pythonProcess: ChildProcessWithoutNullStreams | null = null;
let terminalLogs = "";

app.post("/api/terminal/start", (req, res) => {
  if (pythonProcess) {
    return res.json({ status: "running", message: "La consola ya está activa." });
  }
  
  ensureFilesExist();
  terminalLogs = "=== INICIANDO SISTEMA DE INVENTARIO Y VENTAS (Python 3) ===\n";
  
  try {
    pythonProcess = spawn("python3", ["-u", "main.py"], {
      cwd: PROYECTO_DIR,
      env: { ...process.env, PYTHONUNBUFFERED: "1" }
    });
    
    pythonProcess.stdout.on("data", (data) => {
      terminalLogs += data.toString();
    });
    
    pythonProcess.stderr.on("data", (data) => {
      terminalLogs += data.toString();
    });
    
    pythonProcess.on("close", (code) => {
      terminalLogs += `\n\n=== CONSOLA INTERACTIVA FINALIZADA CON CÓDIGO ${code} ===\n`;
      pythonProcess = null;
    });
    
    res.json({ status: "started", message: "Consola de Python iniciada" });
  } catch (error: any) {
    terminalLogs += `\n[ERROR SISTEMA] Al iniciar python3: ${error.message}\n`;
    res.status(500).json({ error: "No se pudo ejecutar el script de Python en el contenedor" });
  }
});

app.get("/api/terminal/logs", (req, res) => {
  res.json({
    logs: terminalLogs,
    isRunning: pythonProcess !== null
  });
});

app.post("/api/terminal/input", (req, res) => {
  const { input } = req.body;
  if (!pythonProcess) {
    return res.status(400).json({ error: "La consola no está activa. Iníciela primero." });
  }
  
  try {
    terminalLogs += `${input}\n`;
    pythonProcess.stdin.write(`${input}\n`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: `Error de entrada: ${err.message}` });
  }
});

app.post("/api/terminal/stop", (req, res) => {
  if (!pythonProcess) {
    return res.json({ message: "No hay proceso activo." });
  }
  
  try {
    pythonProcess.kill("SIGINT");
    pythonProcess = null;
    terminalLogs += "\n\n=== CONSOLA FINALIZADA POR EL USUARIO ===\n";
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: `Error al detener: ${err.message}` });
  }
});

// App launcher
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

startServer();
