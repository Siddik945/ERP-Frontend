# Frontend Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Default credentials

- Admin: `admin@erp.com` / `Admin@12345`
- Manager: `manager@erp.com` / `Manager@12345`
- Employee: `employee@erp.com` / `Employee@12345`

Open `http://localhost:5173`.

## Pages

- `/login`
- `/` Dashboard
- `/products` Product list, search, pagination, edit/delete for Admin/Manager
- `/products/create` Product creation with required image upload
- `/customers` Customer management
- `/sales/create` Create sales with customer selection, multiple products, quantity input, and automatic total
