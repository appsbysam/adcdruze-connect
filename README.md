# Druze Connect Hub

Australian Druze Community (ADC) private members platform.

## Application

The application provides member authentication, a Home dashboard, Events, member Directory, Groups/committees, Business Directory, Volunteer/Donations, Notifications and administration tools.

Navigation colours:
- Home — Green `#0E8A4A`
- Events — Red `#E53935`
- Directory — Yellow `#F4B400`
- Groups — Blue `#2962FF`
- More — White with black outline

## Stack

- React 19
- TanStack Router / TanStack Start
- Vite
- Tailwind CSS
- Supabase authentication and PostgreSQL database

## Local development

Requires Node.js and npm.

```sh
git clone https://github.com/appsbysam/adcdruze-connect.git
cd adcdruze-connect
cp .env.example .env
npm install
npm run dev
```

Populate `.env` with the Supabase URL and publishable key for the ADC database.

## Environment variables

Client:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

SSR equivalents, when required by the deployment target:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

Do not commit `.env` files.

## Database

Supabase schema migrations are stored under `supabase/migrations` and the project configuration under `supabase/config.toml`.

## Deployment

The application is designed to be deployed independently from the service originally used to prototype it. Production hosting must provide the environment variables above and support the TanStack Start build output.
