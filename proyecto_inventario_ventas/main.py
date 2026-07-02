import os
import sys
from modulos.stock import cargar_inventario, guardar_inventario
from modulos.ventas import registrar_venta, listar_ventas
from modulos.alertas import verificar_y_notificar
from modulos.reportes import total_ventas_del_dia, producto_mas_vendido, listar_productos_criticos

def inicializar_productos():
    # Crea el directorio y el archivo de productos de prueba si no existen
    os.makedirs("datos", exist_ok=True)
    productos_file = os.path.join("datos", "productos.json")
    if not os.path.exists(productos_file):
        productos_muestra = [
            {"id": "P001", "nombre": "Laptop Gamer Lenovo", "stock_actual": 15, "stock_minimo": 5, "precio_venta": 1200.00},
            {"id": "P002", "nombre": "Mouse Óptico Logitech", "stock_actual": 3, "stock_minimo": 10, "precio_venta": 25.50},
            {"id": "P003", "nombre": "Teclado Mecánico Razer", "stock_actual": 8, "stock_minimo": 5, "precio_venta": 85.00},
            {"id": "P004", "nombre": "Monitor ASUS 24\" UltraWide", "stock_actual": 2, "stock_minimo": 3, "precio_venta": 180.00}
        ]
        guardar_inventario(productos_muestra)
        print("[SISTEMA] Archivo de productos muestra generado en 'datos/productos.json'.")

def mostrar_menu():
    print("\n" + "═" * 50)
    print("      SISTEMA DE INVENTARIO Y VENTAS v1.0")
    print("═" * 50)
    print(" [MÓDULO DE VENTAS]")
    print("   1) Registrar una venta")
    print("   2) Ver historial de ventas")
    print(" ──────────────────────────────────────────────")
    print(" [MÓDULO DE ALERTAS]")
    print("   3) Verificar alertas de stock crítico")
    print(" ──────────────────────────────────────────────")
    print(" [MÓDULO DE REPORTES]")
    print("   4) Ver ingresos totales")
    print("   5) Ver producto más vendido (Estrella)")
    print("   6) Listar productos críticos")
    print(" ──────────────────────────────────────────────")
    print(" [OPCIÓN DE SALIDA]")
    print("   7) Cerrar programa")
    print("═" * 50)

def main():
    # Inicializar productos si es la primera ejecución
    inicializar_productos()
    
    # Cargar el inventario
    inventario = cargar_inventario()

    while True:
        mostrar_menu()
        try:
            opcion = input("Seleccione una opción (1-7): ").strip()
        except KeyboardInterrupt:
            print("\n\nSaliendo del programa de forma segura...")
            break

        if opcion == "1":
            print("\n--- REGISTRAR VENTA ---")
            # Recargamos para tener consistencia con los datos en disco
            inventario = cargar_inventario()
            inventario = registrar_venta(inventario)
        elif opcion == "2":
            listar_ventas()
        elif opcion == "3":
            verificar_y_notificar()
        elif opcion == "4":
            total_ventas_del_dia()
        elif opcion == "5":
            producto_mas_vendido()
        elif opcion == "6":
            listar_productos_criticos()
        elif opcion == "7":
            print("\nCerrando el sistema. ¡Gracias por usar nuestro software!")
            sys.exit(0)
        else:
            print("\n[ERROR] Opción no válida. Por favor, intente de nuevo con un número de 1 a 7.")

if __name__ == "__main__":
    main()
