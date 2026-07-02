import os
from modulos.stock import cargar_inventario

def evaluar_stock_critico(productos: list) -> list:
    productos_criticos = []
    campos_requeridos = ("id", "nombre", "stock_actual", "stock_minimo")

    for p in productos:
        if all(k in p for k in campos_requeridos):
            if p["stock_actual"] <= p["stock_minimo"]:
                productos_criticos.append(p)
    return productos_criticos

def desplegar_reporte_corporativo(productos_criticos: list) -> None:
    if not productos_criticos:
        print("\n" + "=" * 85)
        print(" AUDITORÍA DE INVENTARIO: ESTADO OPERACIONAL ÓPTIMO ".center(85, "▪"))
        print("=" * 85)
        print(">>> No se detectaron productos por debajo del stock mínimo establecido. <<<".center(85))
        print("=" * 85 + "\n")
        return

    print("\n" + "=" * 85)
    print(" REPORTE CORPORATIVO: ALERTA DE REABASTECIMIENTO CRÍTICO ".center(85, "⚠️"))
    print("=" * 85)
    print(f"{'CÓDIGO/ID':<10} | {'PRODUCTO':<35} | {'STOCK ACT.':<15} | {'STOCK MÍN.':<15}")
    print("-" * 85)

    for p in productos_criticos:
        print(f"{p['id']:<10} | {p['nombre']:<35} | {p['stock_actual']:<15} | {p['stock_minimo']:<15}")

    print("=" * 85)
    print(f" [ERR-CRIT] Alerta de reordenamiento activo para {len(productos_criticos)} ítem(s).")
    print("=" * 85 + "\n")

def verificar_y_notificar() -> None:
    inventario = cargar_inventario()
    if not inventario:
        print("\n" + "!" * 85)
        print(" [ERR-SYS-01] El inventario está vacío o no se pudo leer 'datos/productos.json'.")
        print("!" * 85 + "\n")
        return

    criticos = evaluar_stock_critico(inventario)
    desplegar_reporte_corporativo(criticos)
