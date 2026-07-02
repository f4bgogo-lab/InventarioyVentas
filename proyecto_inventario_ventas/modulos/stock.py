import json
import os

PRODUCTOS_FILE = os.path.join("datos", "productos.json")

def cargar_inventario():
    if not os.path.exists(PRODUCTOS_FILE):
        return []
    try:
        with open(PRODUCTOS_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, IOError):
        return []

def guardar_inventario(inventario):
    os.makedirs("datos", exist_ok=True)
    with open(PRODUCTOS_FILE, "w", encoding="utf-8") as file:
        json.dump(inventario, file, indent=4, ensure_ascii=False)
