# BatikIn
*Platform Digital Batik dengan Machine Learning & Modern UI*
[cloudflarebutton]
## About The Project
BatikIn is a sophisticated web application designed to bridge the gap between traditional batik artisans and the modern consumer, leveraging AI for analysis and verification. The platform serves three key user groups: Artisans, Administrators, and the Public.
Artisans can register for an account, and once verified by an administrator, they can manage their portfolio of authentic batik creations. For each piece, they can input rich details including its history, the meaning behind its motif, and high-quality images. The system's core feature is the ability to generate a unique, printable QR code for every batik item, serving as a digital certificate of authenticity.
The public-facing side of the application is a beautifully curated gallery of these authenticated batiks. Anyone can browse the collection, learn about the cultural significance of different patterns, and discover the talented artisans behind them. By scanning a product's QR code, consumers are directed to a dedicated page on the platform, instantly verifying the item's authenticity and accessing its complete story.
This system aims to combat counterfeit products, preserve cultural knowledge, and economically empower local artisan communities through modern technology.
## Key Features
### Web Platform
- **Artisan Registration:** A secure portal for artisans to register with document uploads for verification.
- **Batik CRUD Management:** Verified artisans can create, read, update, and delete their batik product listings.
- **AI Motif Analysis:** Upload a batik image and let our AI identify the motif, origin, and philosophy.
- **QR Code Generation:** Generate and download unique QR codes for each batik item to serve as a digital tag of authenticity.
- **Admin Verification:** An admin dashboard to review and approve/reject artisan applications.
- **Public Gallery:** A public-facing system to display all authenticated batik, promoting education and discovery.
### Mobile-Friendly Experience
- **QR Code Scanner:** Scan QR codes on batik products to instantly verify authenticity using your phone's camera.
- **Detailed Information:** View the batik's history, motif meaning, artisan details, and origin.
- **Promotional Details:** Access artisan/store location, contact information, and links to maps or messaging apps.
- **Search & Discovery:** Filter and search for batiks by type, motif, or region.
## Technology Stack
This project is built with a modern, edge-native stack:
- **Frontend:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Backend:** [Hono](https://hono.dev/) running on [Cloudflare Workers](https://workers.cloudflare.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **UI Framework:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Routing:** [React Router](https://reactrouter.com/)
- **Storage:** [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- **Icons:** [Lucide React](https://lucide.dev/)
## Project Structure
The project is organized into three main directories:
- `/src`: Contains the frontend React application, including pages, components, and hooks.
- `/worker`: Contains the Hono backend API running on a Cloudflare Worker, including routes and entity definitions for the Durable Object.
- `/shared`: Contains TypeScript types and interfaces shared between the frontend and the backend to ensure type safety.
## Getting Started
Follow these instructions to get a local copy up and running for development and testing purposes.
### Prerequisites
You need to have [Bun](https://bun.sh/) and the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed on your machine.
- **Install Bun:**
  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```
- **Install Wrangler:**
  ```sh
  bun install -g wrangler
  ```
### Installation
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/batikin.git
    cd batikin
    ```
2.  **Install dependencies:**
    ```sh
    bun install
    ```
## Development
To start the local development server, which includes both the Vite frontend and the Wrangler backend, run the following command:
```sh
bun dev
```
This will:
- Start the Vite development server for the React frontend, typically on `http://localhost:3000`.
- Start the Wrangler development server for the Hono API.
- The frontend is configured to proxy API requests (`/api/*`) to the local worker, enabling seamless full-stack development.
## Deployment
This application is designed for easy deployment to the Cloudflare global network.
1.  **Build the application:**
    The deployment script automatically builds the project, so a manual build step is not required.
2.  **Deploy to Cloudflare:**
    Run the deploy script. This will build the frontend application, bundle the worker, and deploy everything to your Cloudflare account.
    ```sh
    bun deploy
    ```
Alternatively, you can deploy your own version of this project with a single click.
[cloudflarebutton]