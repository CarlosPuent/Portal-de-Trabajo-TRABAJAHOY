# EstacionCafé API - Complete API Documentation

> **Base URL**: `http://localhost:3484/api`
> **Swagger UI**: `http://localhost:3484/api/docs`
> **Content-Type**: `application/json` (unless otherwise noted)

---

## Table of Contents

- [Common Response Format](#common-response-format)
- [Authentication](#authentication)
- [Enum Reference](#enum-reference)
- [1. Authentication & Users](#1-authentication--users)
- [2. User Types](#2-user-types)
- [3. Products](#3-products)
- [4. Product Types](#4-product-types)
- [5. Bills (Invoices)](#5-bills-invoices)
- [6. Bill Details](#6-bill-details)
- [7. Tables](#7-tables)
- [8. Suppliers](#8-suppliers)
- [9. Consumables](#9-consumables)
- [10. Consumable Types](#10-consumable-types)
- [11. Ingredients](#11-ingredients)
- [12. Purchases](#12-purchases)
- [13. Cash Registers](#13-cash-registers)

---

## Common Response Format

All endpoints return JSON with a consistent envelope:

### Success Response
```json
{
  "status": "success",
  "message": "Description of what happened",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Description of the error",
  "campo": "field_name",       // optional: which field failed validation
  "error": "error_code"        // optional: Zod error code
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success (GET, PUT, DELETE) |
| `201` | Created (POST) |
| `202` | Accepted (some DELETEs) |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized (missing/invalid token) |
| `404` | Not Found |
| `409` | Conflict (duplicate resource) |
| `500` | Internal Server Error |

---

## Authentication

### Bearer Token Auth

Protected endpoints require an `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

Alternatively, the token can be sent as an `auth_token` cookie.

### Endpoints with Auth Requirements

| Endpoint | Required Roles |
|----------|---------------|
| `DELETE /products/:id` | `all` (any authenticated user) |
| `DELETE /bills/:id` | `admin`, `mesero`, `cajero` |
| `DELETE /users/:id` | `admin` |
| `DELETE /user-types/:id` | `admin` |
| `DELETE /suppliers/:id` | `admin` |
| `DELETE /purchases/:id` | `admin` |
| `DELETE /cash-registers/:id` | `cajero`, `admin` |
| `DELETE /tables/:id` | `admin`, `mesero`, `cajero` |
| `DELETE /bill-details/:id` | `admin`, `mesero`, `cajero` |
| `DELETE /consumable/:id` | `all` |
| `DELETE /consumable-type/:id` | `all` |
| `DELETE /ingredient/:id` | `all` |
| `DELETE /product-type/:id` | `all` |

### RBAC Roles

The `authorize()` middleware checks the user's role. Valid roles:
- `"admin"` - Full access
- `"mesero"` - Waiter access
- `"cajero"` - Cashier access
- `"all"` - Any authenticated user

---

## Enum Reference

### Status (Bill Status)
| Value | Description |
|-------|-------------|
| `"open"` | Bill is open |
| `"closed"` | Bill is closed |
| `"draft"` | Bill is a draft |
| `"finished"` | Bill is finished |

### TableStatus
| Value | Description |
|-------|-------------|
| `"disponible"` | Table is available |
| `"ocupada"` | Table is occupied |
| `"reservada"` | Table is reserved |

### UnitMeasurement
| Value | Description |
|-------|-------------|
| `"g"` | Grams |
| `"kg"` | Kilograms |
| `"l"` | Liters |
| `"ml"` | Milliliters |
| `"oz"` | Ounces |
| `"lb"` | Pounds |
| `"unit"` | Units |
| `"tbsp"` | Tablespoons |
| `"tsp"` | Teaspoons |
| `"cup"` | Cups |
| `"piece"` | Pieces |

---

## 1. Authentication & Users

### 1.1 Login

**POST** `/users/login`

Authenticate a user and receive a JWT token (also set as `auth_token` cookie).

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response `200`:**
```json
{
  "status": "success",
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1 hora"
  }
}
```

**Errors:**
| Status | Body |
|--------|------|
| `500` | `{ "status": "error", "message": "Error al iniciar sesión: ..." }` |

---

### 1.2 Logout

**POST** `/users/logout`

Clear the `auth_token` cookie.

**Response `200`:**
```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

---

### 1.3 List All Users

**GET** `/users`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Usuarios obtenidos correctamente",
  "data": [
    {
      "userId": 1,
      "username": "admin",
      "email": "admin@estacioncafe.com",
      "userTypeId": 1,
      "userType": {
        "userTypeId": 1,
        "name": "Administrador",
        "permissionLevel": 10
      }
    }
  ]
}
```

---

### 1.4 Get User by ID

**GET** `/users/:id`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` (path) | User ID (positive integer as string) |

**Response `200`:**
```json
{
  "status": "success",
  "message": "Usuario obtenido correctamente",
  "data": {
    "userId": 1,
    "username": "admin",
    "email": "admin@estacioncafe.com",
    "userTypeId": 1
  }
}
```

**Errors:**
| Status | Body |
|--------|------|
| `400` | `{ "status": "error", "message": "ID inválido: ..." }` |
| `404` | `{ "status": "error", "message": "Usuario no encontrado" }` |

---

### 1.5 Get Users by Type

**GET** `/users/type/:typeId`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `typeId` | `string` (path) | User type ID |

**Response `200`:**
```json
{
  "status": "success",
  "message": "Usuarios por tipo obtenidos correctamente",
  "data": [...]
}
```

---

### 1.6 Create User

**POST** `/users`

**Request Body:**
```json
{
  "username": "string (3-50 chars)",
  "password": "string (min 6 chars)",
  "email": "string (valid email)",
  "typeId": 1
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `username` | `string` | Min 3, max 50 characters, trimmed |
| `password` | `string` | Min 6, max 100 characters |
| `email` | `string` | Must be valid email, auto-lowercased |
| `typeId` | `number` or `string` | Positive integer |

**Response `201`:**
```json
{
  "status": "success",
  "message": "Usuario creado correctamente",
  "data": {
    "userId": 2,
    "username": "newuser",
    "email": "newuser@estacioncafe.com",
    "typeId": 1
  }
}
```

**Errors:**
| Status | Body |
|--------|------|
| `400` | `{ "status": "error", "message": "Datos inválidos: ...", "campo": "...", "error": "..." }` |

---

### 1.7 Update User

**PUT** `/users/:id`

**Path Params:** `id` (positive integer as string)

**Request Body** (all fields optional):
```json
{
  "username": "string (3-50 chars)",
  "password": "string (min 6 chars)",
  "email": "string (valid email)",
  "typeId": 1
}
```

**Response `200`:**
```json
{
  "status": "success",
  "message": "Usuario actualizado correctamente",
  "data": { ... }
}
```

**Errors:**
| Status | Body |
|--------|------|
| `400` | Validation error |
| `404` | User not found |

---

### 1.8 Delete User

**DELETE** `/users/:id`

> **Auth Required**: `admin` role

**Path Params:** `id` (positive integer as string)

**Response `200`:**
```json
{
  "status": "success",
  "message": "Usuario eliminado correctamente",
  "data": { ... }
}
```

**Errors:**
| Status | Body |
|--------|------|
| `401` | Token missing/invalid |
| `404` | User not found |

---

## 2. User Types

### 2.1 List All User Types

**GET** `/user-types`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Tipos de usuario obtenidos correctamente",
  "data": [
    {
      "userTypeId": 1,
      "name": "Administrador",
      "permissionLevel": 10
    }
  ]
}
```

---

### 2.2 Get User Type by ID

**GET** `/user-types/:id`

**Path Params:** `id` (positive integer as string)

**Response `200`:** `{ status, message, data }`

**Errors:** `400` (invalid ID), `404` (not found)

---

### 2.3 Create User Type

**POST** `/user-types`

**Request Body:**
```json
{
  "name": "string (1-50 chars)",
  "permissionLevel": 5
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | `string` | Min 1, max 50, trimmed |
| `permissionLevel` | `number` | Integer, 0-10 |

**Response `201`:** `{ status, message, data }`

---

### 2.4 Update User Type

**PUT** `/user-types/:id`

**Path Params:** `id` (positive integer as string)

**Request Body** (all fields optional):
```json
{
  "name": "string (1-50 chars)",
  "permissionLevel": 5
}
```

**Response `200`:** `{ status, message, data }`

---

### 2.5 Delete User Type

**DELETE** `/user-types/:id`

> **Auth Required**: `admin` role

**Response `200`:** `{ status, message, data }`

---

## 3. Products

### 3.1 List All Products

**GET** `/products`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Productos obtenidos correctamente",
  "data": [
    {
      "productId": 1,
      "name": "Espresso",
      "description": "Café espresso simple",
      "price": 2.50,
      "cost": 1.00,
      "productTypeId": 1,
      "active": true
    }
  ]
}
```

---

### 3.2 List Active Products

**GET** `/products/active`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Productos activos obtenidos correctamente",
  "data": [...]
}
```

---

### 3.3 Get Product by ID

**GET** `/products/:id`

**Path Params:** `id` (positive integer)

**Response `200`:** `{ status, message, data }`

**Errors:** `400` (invalid ID), `404` (not found)

---

### 3.4 Create Product

**POST** `/products`

**Request Body:**
```json
{
  "name": "Espresso Doble",
  "description": "Café espresso doble",
  "price": "3.50",
  "cost": "1.50",
  "productTypeId": 1
}
```

> **Note**: `price` and `cost` can be sent as `string` or `number`. They are auto-parsed and rounded to 2 decimals.

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | `string` | Min 1, max 50, trimmed |
| `description` | `string` | Min 1, max 100, trimmed |
| `price` | `string` or `number` | Must be > 0, auto-parsed to float |
| `cost` | `string` or `number` | Must be > 0, auto-parsed to float |
| `productTypeId` | `string` or `number` | Positive integer |
| **Cross-field** | | `price` must be > `cost` |

**Response `201`:**
```json
{
  "status": "success",
  "message": "El producto se guardó correctamente",
  "data": { ... }
}
```

---

### 3.5 Update Product

**PUT** `/products/:id`

**Path Params:** `id` (positive integer)

**Request Body** (all fields optional):
```json
{
  "name": "Espresso Doble",
  "description": "Café espresso doble",
  "price": "3.50",
  "cost": "1.50",
  "productTypeId": 1
}
```

**Response `200`:** `{ status, message, data }`

---

### 3.6 Delete Product

**DELETE** `/products/:id`

> **Auth Required**: any authenticated user (`all`)

**Response `200`:** `{ status, message, data }`

---

## 4. Product Types

### 4.1 List All Product Types

**GET** `/product-type`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Tipos de producto obtenidos correctamente",
  "data": [
    {
      "productTypeId": 1,
      "name": "Café Caliente"
    }
  ]
}
```

---

### 4.2 Get Product Type by ID

**GET** `/product-type/:id`

**Response `200`:** `{ status, message, data }`

---

### 4.3 Create Product Type

**POST** `/product-type`

**Request Body:**
```json
{
  "name": "Café Frío"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | `string` | Min 1, max 50, trimmed |

**Response `201`:** `{ status, message, data }`

---

### 4.4 Update Product Type

**PUT** `/product-type/:id`

**Request Body** (all fields optional):
```json
{
  "name": "Café Frío"
}
```

**Response `200`:** `{ status, message, data }`

---

### 4.5 Delete Product Type

**DELETE** `/product-type/:id`

> **Auth Required**: any authenticated user (`all`)

**Response `200`:** `{ status, message, data }`

---

## 5. Bills (Invoices)

### 5.1 List All Bills

**GET** `/bills`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Facturas obtenidas correctamente",
  "data": [
    {
      "billId": 1,
      "customer": "Juan Pérez",
      "cashRegisterId": 1,
      "tableId": "A1",
      "total": 15.50,
      "status": "open",
      "date": "2025-04-10T12:00:00.000Z"
    }
  ]
}
```

---

### 5.2 Get Bill by ID

**GET** `/bills/:id`

**Path Params:** `id` (positive integer)

**Response `200`:** `{ status, message, data }`

---

### 5.3 Get Bills by Customer

**GET** `/bills/customer/:customer`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `customer` | `string` | Customer name |

**Response `200`:** `{ status, message, data }`

---

### 5.4 Get Bills by Table

**GET** `/bills/table/:tableId`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `tableId` | `string` | Table ID (e.g., "A1") |

**Response `200`:** `{ status, message, data }`

---

### 5.5 Get Bills by Date Range

**GET** `/bills/date-range`

**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | `string` | Yes | Start date (ISO format) |
| `endDate` | `string` | Yes | End date (ISO format) |

**Example:** `GET /bills/date-range?startDate=2025-01-01&endDate=2025-04-10`

**Response `200`:** `{ status, message, data }`

**Errors:**
| Status | Body |
|--------|------|
| `400` | `{ "status": "error", "message": "startDate y endDate son requeridos" }` |

---

### 5.6 Close All Bills for a Table

**POST** `/bills/table/:tableId/close`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `tableId` | `string` | Table ID (1-10 chars) |

**Response `200`:**
```json
{
  "status": "success",
  "message": "Se cerraron 2 facturas de la mesa A1",
  "data": { "updated": 2 }
}
```

---

### 5.7 Create Bill

**POST** `/bills`

**Request Body:**
```json
{
  "customer": "Juan Pérez",
  "cashRegister": 1,
  "tableId": "A1",
  "total": 15.50,
  "status": "open",
  "date": "2025-04-10T18:00:00Z"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `customer` | `string` | Min 1, max 100, trimmed |
| `cashRegister` | `number` | Integer > 0 |
| `tableId` | `string` | Optional, max 10 chars, trimmed |
| `total` | `number` | Non-negative, max 2 decimals |
| `status` | `Status` | Optional: `"open"`, `"closed"`, `"draft"`, `"finished"` |
| `date` | `string` or `Date` | Valid date (auto-converted to El Salvador UTC-6) |

**Response `201`:** `{ status, message, data }`

---

### 5.8 Update Bill

**PUT** `/bills/:id`

**Request Body** (all fields optional):
```json
{
  "customer": "María López",
  "cashRegisterId": 2,
  "tableId": "B2",
  "total": 20.00,
  "status": "closed",
  "date": "2025-04-10T18:00:00Z"
}
```

**Response `200`:** `{ status, message, data }`

---

### 5.9 Delete Bill

**DELETE** `/bills/:id`

> **Auth Required**: `admin`, `mesero`, `cajero`

**Response `200`:** `{ status, message, data }`

---

## 6. Bill Details

### 6.1 List All Bill Details

**GET** `/bill-details`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Detalles obtenidos corretamente",
  "data": [
    {
      "billDetailId": 1,
      "billId": 1,
      "productId": 1,
      "quantity": 2,
      "price": 2.50,
      "subTotal": 5.00
    }
  ]
}
```

---

### 6.2 Get Bill Details by Bill ID

**GET** `/bill-details/bill/:billId`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `billId` | `string` (path) | Bill ID (positive integer) |

**Response `200`:**
```json
{
  "status": "success",
  "message": "Detalles obtenidos correctamente",
  "data": [
    {
      "productId": 1,
      "name": "Espresso",
      "quantity": 2,
      "price": 2.50,
      "subTotal": 5.00
    }
  ]
}
```

**Errors:**
| Status | Body |
|--------|------|
| `400` | `{ "status": "error", "message": "ID de factura inválido: debe ser un número" }` |
| `404` | `{ "status": "error", "message": "No se encontraron detalles para la factura con ID X" }` |

---

### 6.3 Create Bill Detail

**POST** `/bill-details`

This endpoint creates a bill with its line items in a single operation. It also validates product stock.

**Request Body:**
```json
{
  "billId": 1,
  "billDetails": [
    {
      "productId": 1,
      "name": "Espresso",
      "quantity": 2,
      "price": 2.50,
      "subTotal": 5.00
    },
    {
      "productId": 3,
      "name": "Cappuccino",
      "quantity": 1,
      "price": 4.00,
      "subTotal": 4.00
    }
  ]
}
```

**Validation Rules:**

**Root:**
| Field | Type | Rules |
|-------|------|-------|
| `billId` | `number` | Integer > 0 |
| `billDetails` | `array` | Min 1 item |

**Each billDetail item:**
| Field | Type | Rules |
|-------|------|-------|
| `productId` | `number` | Integer > 0 |
| `name` | `string` | Min 1, max 100 |
| `quantity` | `number` | Integer > 0 |
| `price` | `number` | > 0, max 2 decimals |
| `subTotal` | `number` | Non-negative, max 2 decimals |

**Response `201`:**
```json
{
  "status": "success",
  "message": "Factura y detalles guardados correctamente",
  "data": { ... }
}
```

**Errors:**
| Status | Body |
|--------|------|
| `400` | `{ "status": "error", "message": "Stock insuficiente", "type": "stock_error" }` |
| `400` | `{ "status": "error", "message": "Datos inválidos: ..." }` |
| `400` | `{ "status": "error", "message": "El producto X no es correcto" }` |

---

### 6.4 Delete Bill Detail

**DELETE** `/bill-details/:id`

> **Auth Required**: `admin`, `mesero`, `cajero`

**Path Params:** `id` (positive integer)

**Response `202`:**
```json
{
  "status": "success",
  "message": "Detalle eliminado correctamente"
}
```

---

## 7. Tables

### 7.1 List All Tables

**GET** `/tables`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Mesas obtenidas correctamente",
  "data": [
    {
      "tableId": "A1",
      "zone": "Interior",
      "status": "disponible",
      "bills": []
    }
  ]
}
```

---

### 7.2 Get Available Tables

**GET** `/tables/available`

**Response `200`:** `{ status, message, data }`

---

### 7.3 Get Tables by Zone

**GET** `/tables/zone/:zone`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `zone` | `string` | Zone name |

**Response `200`:** `{ status, message, data }`

---

### 7.4 Get Tables by Status

**GET** `/tables/status/:status`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | `string` | One of: `"disponible"`, `"ocupada"`, `"reservada"` |

**Response `200`:** `{ status, message, data }`

**Errors:**
| Status | Body |
|--------|------|
| `400` | `{ "status": "error", "message": "Estado inválido. Debe ser uno de: ..." }` |

---

### 7.5 Get Table by ID

**GET** `/tables/:id`

**Path Params:** `id` (string, 1-10 chars, table ID like "A1")

**Response `200`:** `{ status, message, data }`

---

### 7.6 Create Table

**POST** `/tables`

**Request Body:**
```json
{
  "tableId": "A1",
  "zone": "Interior",
  "status": "disponible"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `tableId` | `string` | Min 1, max 10, regex: `[A-Z0-9]+`, trimmed |
| `zone` | `string` | Min 1, max 50, trimmed |
| `status` | `TableStatus` | Optional, default: `"disponible"` |

**Response `201`:** `{ status, message, data }`

**Errors:**
| Status | Body |
|--------|------|
| `409` | `{ "status": "error", "message": "La mesa ya existe" }` |

---

### 7.7 Update Table

**PUT** `/tables/:id`

**Request Body** (all fields optional):
```json
{
  "zone": "Terraza",
  "status": "ocupada"
}
```

**Response `200`:** `{ status, message, data }`

---

### 7.8 Update Table Status (PATCH)

**PATCH** `/tables/:id/status`

**Request Body:**
```json
{
  "status": "ocupada"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `status` | `TableStatus` | Required. One of: `"disponible"`, `"ocupada"`, `"reservada"` |

**Response `200`:**
```json
{
  "status": "success",
  "message": "Estado de mesa actualizado correctamente",
  "data": { ... }
}
```

---

### 7.9 Delete Table

**DELETE** `/tables/:id`

> **Auth Required**: `admin`, `mesero`, `cajero`

**Response `200`:** `{ status, message, data }`

---

## 8. Suppliers

### 8.1 List All Suppliers

**GET** `/suppliers`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Proveedores obtenidos correctamente",
  "data": [
    {
      "supplierId": 1,
      "name": "Café de Altura S.A.",
      "phone": "+50322223333",
      "email": "ventas@cafealtura.com",
      "active": true
    }
  ]
}
```

---

### 8.2 List Active Suppliers

**GET** `/suppliers/active`

**Response `200`:** `{ status, message, data }`

---

### 8.3 Get Supplier by ID

**GET** `/suppliers/:id`

**Path Params:** `id` (positive integer)

**Response `200`:** `{ status, message, data }`

---

### 8.4 Create Supplier

**POST** `/suppliers`

**Request Body:**
```json
{
  "name": "Café de Altura S.A.",
  "phone": "+50322223333",
  "email": "ventas@cafealtura.com",
  "active": true
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | `string` | Min 1, max 100, trimmed |
| `phone` | `string` | Required, regex: `^(\+503)?[2-9]\d{3}-?\d{4}$`, dashes/spaces stripped |
| `email` | `string` | Valid email, auto-lowercased |
| `active` | `boolean` | Optional, default: `true` |

**Response `201`:** `{ status, message, data }`

---

### 8.5 Update Supplier

**PUT** `/suppliers/:id`

**Request Body** (all fields optional):
```json
{
  "name": "Café de Altura S.A. de C.V.",
  "phone": "+50322224444",
  "email": "nuevo@cafealtura.com",
  "active": false
}
```

**Response `200`:** `{ status, message, data }`

---

### 8.6 Delete Supplier

**DELETE** `/suppliers/:id`

> **Auth Required**: `admin`

**Response `200`:** `{ status, message, data }`

---

## 9. Consumables

### 9.1 List All Consumables

**GET** `/consumable`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Consumibles obtenidos correctamente",
  "data": [
    {
      "consumableId": 1,
      "name": "Café en Grano",
      "supplierId": 1,
      "cosumableTypeId": 1,
      "quantity": 50.0,
      "unitMeasurement": "kg",
      "cost": 12.50,
      "supplier": { ... },
      "consumableType": { ... },
      "active": true
    }
  ]
}
```

---

### 9.2 Get Consumable by ID

**GET** `/consumable/:id`

**Path Params:** `id` (positive integer)

**Response `200`:** `{ status, message, data }`

---

### 9.3 Get Consumables by Supplier

**GET** `/consumable/supplier/:supplierId`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `supplierId` | `string` (path) | Supplier ID |

**Response `200`:** `{ status, message, data }`

---

### 9.4 Create Consumable

**POST** `/consumable`

**Request Body:**
```json
{
  "supplierId": 1,
  "name": "Café en Grano",
  "cosumableTypeId": 1,
  "quantity": "50.0",
  "unitMeasurement": "kg",
  "cost": "12.50"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `supplierId` | `string` or `number` | Positive integer |
| `name` | `string` | Min 1, max 255, trimmed |
| `cosumableTypeId` | `string` or `number` | Non-negative integer |
| `quantity` | `string` or `number` | Non-negative |
| `unitMeasurement` | `UnitMeasurement` | Required enum value |
| `cost` | `string` or `number` | Non-negative |

**Response `201`:** `{ status, message, data }`

---

### 9.5 Update Consumable

**PUT** `/consumable/:id`

**Request Body** (all fields optional):
```json
{
  "supplierId": 2,
  "name": "Café Molido",
  "cosumableTypeId": 1,
  "quantity": 30.0,
  "unitMeasurement": "kg",
  "cost": 10.00
}
```

**Response `200`:** `{ status, message, data }`

---

### 9.6 Delete Consumable

**DELETE** `/consumable/:id`

> **Auth Required**: any authenticated user (`all`)

**Response `200`:** `{ status, message, data }`

---

## 10. Consumable Types

### 10.1 List All Consumable Types

**GET** `/consumable-type`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Tipos de consumibles obtenidos correctamente",
  "data": [
    {
      "consumableTypeId": 1,
      "name": "Granos"
    }
  ]
}
```

---

### 10.2 Get Consumable Type by ID

**GET** `/consumable-type/:id`

**Response `200`:** `{ status, message, data }`

---

### 10.3 Create Consumable Type

**POST** `/consumable-type`

**Request Body:**
```json
{
  "name": "Lácteos"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | `string` | Min 1, max 255, trimmed |

**Response `201`:** `{ status, message, data }`

---

### 10.4 Update Consumable Type

**PUT** `/consumable-type/:id`

**Request Body:**
```json
{
  "name": "Lácteos y Derivados"
}
```

**Response `200`:** `{ status, message, data }`

---

### 10.5 Delete Consumable Type

**DELETE** `/consumable-type/:id`

> **Auth Required**: any authenticated user (`all`)

**Response `200`:** `{ status, message, data }`

---

## 11. Ingredients

### 11.1 List All Ingredients

**GET** `/ingredient`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Ingredientes obtenidos correctamente",
  "data": [
    {
      "ingredientId": 1,
      "name": "Café Espresso",
      "quantity": 30,
      "productId": 1,
      "consumableId": 1,
      "product": { ... },
      "consumable": { ... }
    }
  ]
}
```

---

### 11.2 Get Ingredient by ID

**GET** `/ingredient/:id`

**Path Params:** `id` (positive integer)

**Response `200`:** `{ status, message, data }`

---

### 11.3 Get Ingredients by Product

**GET** `/ingredient/product/:productId`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `productId` | `string` (path) | Product ID |

**Response `200`:**
```json
{
  "status": "success",
  "message": "Ingredientes del producto obtenidos correctamente",
  "data": [...]
}
```

---

### 11.4 Create Ingredient

**POST** `/ingredient`

**Request Body:**
```json
{
  "name": "Café Espresso",
  "quantity": "30",
  "productId": 1,
  "consumableId": 1
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | `string` | Min 1, max 255, trimmed |
| `quantity` | `string` or `number` | Must be > 0 |
| `productId` | `string` or `number` | Positive integer |
| `consumableId` | `string` or `number` | Positive integer |

**Response `201`:** `{ status, message, data }`

---

### 11.5 Update Ingredient

**PUT** `/ingredient/:id`

**Request Body** (all fields optional):
```json
{
  "name": "Café Espresso Doble",
  "quantity": 45,
  "productId": 2,
  "consumableId": 2
}
```

**Response `200`:** `{ status, message, data }`

---

### 11.6 Delete Ingredient

**DELETE** `/ingredient/:id`

> **Auth Required**: any authenticated user (`all`)

**Response `200`:** `{ status, message, data }`

---

## 12. Purchases

### 12.1 List All Purchases

**GET** `/purchases`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Compras obtenidas correctamente",
  "data": [
    {
      "purchaseId": 1,
      "date": "2025-04-10T00:00:00.000Z",
      "cashRegister": 1,
      "supplierId": 1,
      "supplierName": "Café de Altura S.A.",
      "total": 500.00
    }
  ]
}
```

---

### 12.2 Get Purchase by ID

**GET** `/purchases/:id`

**Path Params:** `id` (positive integer)

**Response `200`:** `{ status, message, data }`

---

### 12.3 Get Purchases by Supplier

**GET** `/purchases/supplier/:supplierId`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `supplierId` | `string` (path) | Supplier ID |

**Response `200`:** `{ status, message, data }`

---

### 12.4 Create Purchase

**POST** `/purchases`

**Request Body:**
```json
{
  "date": "2025-04-10",
  "cashRegister": "1",
  "supplierId": 1,
  "total": "500.00"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `date` | `string` or `Date` | Required, valid date string, auto-parsed to Date |
| `cashRegister` | `string` or `number` | Positive integer |
| `supplierId` | `string` or `number` | Positive integer |
| `total` | `string` | Parsed to float, must be > 0 |

**Response `201`:**
```json
{
  "status": "success",
  "message": "Compra creada correctamente",
  "data": { ... }
}
```

---

### 12.5 Update Purchase

**PUT** `/purchases/:id`

**Request Body** (all fields optional):
```json
{
  "date": "2025-04-11",
  "cashRegister": 2,
  "supplierId": 2,
  "total": "750.00"
}
```

**Response `200`:** `{ status, message, data }`

---

### 12.6 Delete Purchase

**DELETE** `/purchases/:id`

> **Auth Required**: `admin`

**Response `200`:** `{ status, message, data }`

---

## 13. Cash Registers

### 13.1 List All Cash Registers

**GET** `/cash-registers`

**Response `200`:**
```json
{
  "status": "success",
  "message": "Cajas registradoras obtenidas correctamente",
  "data": [
    {
      "cashRegisterId": 1,
      "number": "001",
      "active": true
    }
  ]
}
```

---

### 13.2 List Active Cash Registers

**GET** `/cash-registers/active`

**Response `200`:** `{ status, message, data }`

---

### 13.3 Get Cash Register by Number

**GET** `/cash-registers/number/:number`

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `number` | `string` (path) | Cash register number |

**Response `200`:** `{ status, message, data }`

---

### 13.4 Get Cash Register by ID

**GET** `/cash-registers/:id`

**Path Params:** `id` (positive integer)

**Response `200`:** `{ status, message, data }`

---

### 13.5 Create Cash Register

**POST** `/cash-registers`

**Request Body:**
```json
{
  "number": "001",
  "active": true
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `number` | `string` | Min 1, max 20, trimmed, parsed to int > 0 |
| `active` | `boolean` | Optional, default: `true` |

**Response `201`:** `{ status, message, data }`

---

### 13.6 Update Cash Register

**PUT** `/cash-registers/:id`

**Request Body** (all fields optional):
```json
{
  "number": "002",
  "active": false
}
```

**Response `200`:** `{ status, message, data }`

---

### 13.7 Delete Cash Register

**DELETE** `/cash-registers/:id`

> **Auth Required**: `cajero`, `admin`

**Response `200`:** `{ status, message, data }`

---

## Complete Endpoint Summary

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| **POST** | `/users/login` | No | - | User login |
| **POST** | `/users/logout` | No | - | User logout |
| **GET** | `/users` | No | - | List all users |
| **GET** | `/users/:id` | No | - | Get user by ID |
| **GET** | `/users/type/:typeId` | No | - | Users by type |
| **POST** | `/users` | No | - | Create user |
| **PUT** | `/users/:id` | No | - | Update user |
| **DELETE** | `/users/:id` | Yes | `admin` | Delete user |
| **GET** | `/user-types` | No | - | List user types |
| **GET** | `/user-types/:id` | No | - | Get user type by ID |
| **POST** | `/user-types` | No | - | Create user type |
| **PUT** | `/user-types/:id` | No | - | Update user type |
| **DELETE** | `/user-types/:id` | Yes | `admin` | Delete user type |
| **GET** | `/products` | No | - | List all products |
| **GET** | `/products/active` | No | - | List active products |
| **GET** | `/products/:id` | No | - | Get product by ID |
| **POST** | `/products` | No | - | Create product |
| **PUT** | `/products/:id` | No | - | Update product |
| **DELETE** | `/products/:id` | Yes | `all` | Delete product |
| **GET** | `/product-type` | No | - | List product types |
| **GET** | `/product-type/:id` | No | - | Get product type by ID |
| **POST** | `/product-type` | No | - | Create product type |
| **PUT** | `/product-type/:id` | No | - | Update product type |
| **DELETE** | `/product-type/:id` | Yes | `all` | Delete product type |
| **GET** | `/bills` | No | - | List all bills |
| **GET** | `/bills/:id` | No | - | Get bill by ID |
| **GET** | `/bills/customer/:customer` | No | - | Bills by customer |
| **GET** | `/bills/table/:tableId` | No | - | Bills by table |
| **GET** | `/bills/date-range` | No | - | Bills by date range |
| **POST** | `/bills/table/:tableId/close` | No | - | Close table bills |
| **POST** | `/bills` | No | - | Create bill |
| **PUT** | `/bills/:id` | No | - | Update bill |
| **DELETE** | `/bills/:id` | Yes | `admin, mesero, cajero` | Delete bill |
| **GET** | `/bill-details` | No | - | List bill details |
| **GET** | `/bill-details/bill/:billId` | No | - | Details by bill ID |
| **POST** | `/bill-details` | No | - | Create bill details |
| **DELETE** | `/bill-details/:id` | Yes | `admin, mesero, cajero` | Delete bill detail |
| **GET** | `/tables` | No | - | List tables |
| **GET** | `/tables/available` | No | - | Available tables |
| **GET** | `/tables/zone/:zone` | No | - | Tables by zone |
| **GET** | `/tables/status/:status` | No | - | Tables by status |
| **GET** | `/tables/:id` | No | - | Get table by ID |
| **POST** | `/tables` | No | - | Create table |
| **PUT** | `/tables/:id` | No | - | Update table |
| **PATCH** | `/tables/:id/status` | No | - | Update table status |
| **DELETE** | `/tables/:id` | Yes | `admin, mesero, cajero` | Delete table |
| **GET** | `/suppliers` | No | - | List suppliers |
| **GET** | `/suppliers/active` | No | - | Active suppliers |
| **GET** | `/suppliers/:id` | No | - | Get supplier by ID |
| **POST** | `/suppliers` | No | - | Create supplier |
| **PUT** | `/suppliers/:id` | No | - | Update supplier |
| **DELETE** | `/suppliers/:id` | Yes | `admin` | Delete supplier |
| **GET** | `/consumable` | No | - | List consumables |
| **GET** | `/consumable/supplier/:supplierId` | No | - | Consumables by supplier |
| **GET** | `/consumable/:id` | No | - | Get consumable by ID |
| **POST** | `/consumable` | No | - | Create consumable |
| **PUT** | `/consumable/:id` | No | - | Update consumable |
| **DELETE** | `/consumable/:id` | Yes | `all` | Delete consumable |
| **GET** | `/consumable-type` | No | - | List consumable types |
| **GET** | `/consumable-type/:id` | No | - | Get consumable type by ID |
| **POST** | `/consumable-type` | No | - | Create consumable type |
| **PUT** | `/consumable-type/:id` | No | - | Update consumable type |
| **DELETE** | `/consumable-type/:id` | Yes | `all` | Delete consumable type |
| **GET** | `/ingredient` | No | - | List ingredients |
| **GET** | `/ingredient/product/:productId` | No | - | Ingredients by product |
| **GET** | `/ingredient/:id` | No | - | Get ingredient by ID |
| **POST** | `/ingredient` | No | - | Create ingredient |
| **PUT** | `/ingredient/:id` | No | - | Update ingredient |
| **DELETE** | `/ingredient/:id` | Yes | `all` | Delete ingredient |
| **GET** | `/purchases` | No | - | List purchases |
| **GET** | `/purchases/supplier/:supplierId` | No | - | Purchases by supplier |
| **GET** | `/purchases/:id` | No | - | Get purchase by ID |
| **POST** | `/purchases` | No | - | Create purchase |
| **PUT** | `/purchases/:id` | No | - | Update purchase |
| **DELETE** | `/purchases/:id` | Yes | `admin` | Delete purchase |
| **GET** | `/cash-registers` | No | - | List cash registers |
| **GET** | `/cash-registers/active` | No | - | Active cash registers |
| **GET** | `/cash-registers/number/:number` | No | - | Cash register by number |
| **GET** | `/cash-registers/:id` | No | - | Get cash register by ID |
| **POST** | `/cash-registers` | No | - | Create cash register |
| **PUT** | `/cash-registers/:id` | No | - | Update cash register |
| **DELETE** | `/cash-registers/:id` | Yes | `cajero, admin` | Delete cash register |
