# E-commerce Frontend

Next.js frontend for the e-commerce application.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- TypeScript

## Requirements
- Node.js 20+
- npm

## Environment Variables
Create a `.env` file in the frontend root:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
```

If your project uses a different variable name in code, set that one instead.

## Install
```bash
npm install
```

## Run
```bash
# development
npm run dev

# production build + run
npm run start
```

## Useful Scripts
```bash
npm run build
npm run lint
```

## Pages
- `/` home
- `/products` products list
- `/add-product` add product
- `/products/[id]/edit` edit product
- `/cart` cart
- `/inventory` inventory

## Repository
GitHub: https://github.com/27Athithya/e-commerce-frontend
