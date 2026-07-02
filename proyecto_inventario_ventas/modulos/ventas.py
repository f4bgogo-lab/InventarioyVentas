import json
import os
from modulos.stock import guardar_inventario

VENTAS_FILE = os.path.join("datos", "ventas.json")

def cargar_ventas():
    if not os.path.exists(VENTAS_FILE):
        return []
    try:
        with open(VENTAS_FILE, "r", encoding="utf-8") as archivo:
            datos = json.load(archivo)
            return datos if isinstance(datos, list) else []
    except (json.JSONDecodeError, IOError):
        return []

def guardar_ventas(ventas):
    os.makedirs("datos", exist_ok=True)
    with open(VENTAS_FILE, "w", encoding="utf-8") as archivo:
        json.dump(ventas, archivo, indent=4, ensure_ascii=False)

def registrar_venta(inventario):
    codigo = input("Ingrese el código del producto: ").upper()
    producto = None

    for item in inventario:
        if str(item["id"]).strip().upper() == codigo:
            producto = item
            break

    if producto is None:
        print("\n[ERROR] Producto no encontrado.")
        return inventario

    print("\nProducto encontrado")
    print("----------------------------")
    print(f"Nombre : {producto['nombre']}")
    print(f"Precio : S/. {producto['precio_venta']:.2f}")
    print(f"Stock  : {producto['stock_actual']}")

    try:
        cantidad = int(input("\nCantidad a vender: "))
    except ValueError:
        print("[ERROR] Debe ingresar un número entero.")
        return inventario

    if cantidad <= 0:
        print("[ERROR] La cantidad debe ser mayor que cero.")
        return inventario

    if cantidad > producto["stock_actual"]:
        print("[ERROR] Stock insuficiente.")
        return inventario

    total = cantidad * producto["precio_venta"]
    producto["stock_actual"] -= cantidad
    guardar_inventario(inventario) 

    ventas = cargar_ventas()
    venta = {
        "id_venta": len(ventas) + 1,
        "id_producto": producto["id"],
        "nombre": producto["nombre"],
        "cantidad": cantidad,
        "precio_unitario": producto["precio_venta"],
        "total": total
    }
    ventas.append(venta)
    guardar_ventas(ventas)

    print("\n===================================")
    print("VENTA REGISTRADA CORRECTAMENTE")
    print("===================================")
    print(f"Producto : {producto['nombre']}")
    print(f"Cantidad : {cantidad}")
    print(f"Total    : S/. {total:.2f}")
    print("===================================")

    return inventario

def listar_ventas():
    ventas = cargar_ventas()
    if not ventas:
        print("\nNo existen ventas registradas.")
        return

    print("\n" + "=" * 70)
    print("              HISTORIAL DE VENTAS")
    print("=" * 70)
    ingreso_total = 0
    for venta in ventas:
        print(f"Venta N°      : {venta['id_venta']}")
        print(f"Código        : {venta['id_producto']}")
        print(f"Producto      : {venta['nombre']}")
        print(f"Cantidad      : {venta['cantidad']}")
        print(f"Precio Unit.  : S/. {venta['precio_unitario']:.2f}")
        print(f"Total Venta   : S/. {venta['total']:.2f}")
        print("-" * 70)
        ingreso_total += venta["total"]

    print(f"Ingreso total generado: S/. {ingreso_total:.2f}")
    print("=" * 70)
