from modulos.ventas import cargar_ventas
from modulos.stock import cargar_inventario
from modulos.alertas import evaluar_stock_critico

def total_ventas_del_dia():
    ventas = cargar_ventas()
    total = sum(v["total"] for v in ventas)
    print(f"\nReporte de ingresos totales: S/. {total:.2f}")

def producto_mas_vendido():
    ventas = cargar_ventas()
    if not ventas:
        print("\nNo hay ventas registradas para calcular el producto estrella.")
        return

    conteos = {}
    for v in ventas:
        nombre = v["nombre"]
        conteos[nombre] = conteos.get(nombre, 0) + v["cantidad"]
    
    estrella = max(conteos, key=conteos.get)
    print(f"\n⭐ Producto Estrella: {estrella} ({conteos[estrella]} unidades vendidas)")

def listar_productos_criticos():
    inventario = cargar_inventario()
    criticos = evaluar_stock_critico(inventario)
    if not criticos:
        print("\nExcelente: Ningún producto requiere reabastecimiento urgente.")
        return
    print("\n--- PRODUCTOS CRÍTICOS QUE REQUIEREN REABASTECIMIENTO ---")
    for p in criticos:
        print(f"- {p['nombre']} (Actual: {p['stock_actual']} | Mínimo: {p['stock_minimo']})")
