# POS Integrado - Proxy Node.js

Este proyecto es un **proxy API** construido con Node.js y Express para consumir de forma segura la API POS Integrado de Transbank desde frontend web, evitando problemas de CORS.

## 🚀 Características

- Proxy a:
  - `POST /api/pago`
  - `GET /api/estado/:commerceCode/:traceId`
  - `POST /api/impresion`
- CORS habilitado
- Uso de variable de entorno para el `X-Client-Id`

## 🛠 Requisitos

- Node.js 14 o superior
- npm o yarn

## 📦 Instalación

```bash
npm install
```

## 🔐 Configuración

Crea un archivo `.env` en la raíz con:

```
CLIENT_ID=tu_client_id_entregado_por_transbank
```

## ▶ Uso local

```bash
npm start
```

Por defecto la app corre en `http://localhost:3000`

## 🌐 Endpoints

### POST `/api/pago`
Crea una solicitud de autorización de pago.

**Body:**
```json
{
  "commerceCode": "122343445",
  "terminalId": "122343445",
  "transactionHostId": "123abdcxx",
  "urlNotify": "https://api.pago.com/597029414300",
  "totalPayment": 10000
}
```

### GET `/api/estado/:commerceCode/:traceId`
Consulta el estado de una transacción previamente publicada.

### POST `/api/impresion`
Envía una impresión base64 al POS.

**Body:**
```json
{
  "commerceCode": "597029414300",
  "terminalId": "123123433",
  "transactionHostId": "123abdcxx",
  "message": "SG9sYSBXb3JsZA=="
}
```

## ☁ Despliegue en DigitalOcean App Platform

1. Haz push a GitHub.
2. En DigitalOcean, crea una nueva **App** y conéctala al repo.
3. Se detectará automáticamente como aplicación Node.js.
4. Asegúrate de configurar la variable `CLIENT_ID` como secret/env var.
5. Define el puerto `3000`.
6. ¡Deploy!

---

Desarrollado por [Álvaro Gutiérrez](https://github.com/alvgutierr) ☕
