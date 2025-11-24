# BatikIn
*Platform Digital Batik dengan Machine Learning & Modern UI*
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Maftuuh1922/warisan-digital)
## About The Project
BatikIn is a sophisticated web application designed to bridge the gap between traditional batik artisans and the modern consumer, leveraging a high-fidelity AI simulation for analysis and verification. The platform serves three key user groups: Artisans, Administrators, and the Public.
Artisans can register for an account, and once verified by an administrator, they can manage their portfolio of authentic batik creations. For each piece, they can input rich details including its history, the meaning behind its motif, and high-quality images. The system's core feature is the ability to generate a unique, printable QR code for every batik item, serving as a digital certificate of authenticity.
The public-facing side of the application is a beautifully curated gallery of these authenticated batiks, with a design deeply integrated with authentic batik textures. Anyone can browse the collection, learn about the cultural significance of different patterns, and discover the talented artisans behind them. By scanning a product's QR code, consumers are directed to a dedicated page on the platform, instantly verifying the item's authenticity and accessing its complete story.
This system aims to combat counterfeit products, preserve cultural knowledge, and economically empower local artisan communities through modern technology.
## Key Features
### Web Platform
- **Artisan Registration:** A secure portal for artisans to register with document uploads for verification.
- **Batik CRUD Management:** Verified artisans can create, read, update, and delete their batik product listings.
- **Real ML Motif Analysis:** Upload a batik image and let our custom ML model (SVM + Random Forest ensemble with 300+ features) identify the motif, origin, and philosophy, complete with Gabor-based heatmap visualization for explainability.
- **Similarity Search:** Find similar batik patterns using feature-based cosine similarity matching.
- **Feature Explainability:** View detailed analysis of color, texture, and geometry features that influence predictions.
- **QR Code Generation:** Generate and download unique QR codes for each batik item to serve as a digital tag of authenticity.
- **Admin Verification:** An admin dashboard to review and approve/reject artisan applications.
- **Public Gallery:** A public-facing system to display all authenticated batik, promoting education and discovery.
- **Thematic UI:** The user interface is deeply integrated with authentic batik textures for an immersive experience.
### Mobile-Friendly Experience
- **QR Code Scanner:** Scan QR codes on batik products to instantly verify authenticity using your phone's camera.
- **Detailed Information:** View the batik's history, motif meaning, artisan details, and origin.
- **Promotional Details:** Access artisan/store location, contact information, and links to maps or messaging apps.
- **Search & Discovery:** Filter and search for batiks by type, motif, or region.
## Technology Stack
This project is built with a modern, edge-native stack:
- **Frontend:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Backend:** [Hono](https://hono.dev/) running on [Cloudflare Workers](https://workers.cloudflare.com/)
- **ML Service:** [FastAPI](https://fastapi.tiangolo.com/) with custom feature extraction pipeline
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **UI Framework:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Routing:** [React Router](https://reactrouter.com/)
- **Storage:** [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- **ML Stack:** scikit-learn, OpenCV, scikit-image, SVM + Random Forest ensemble
- **Icons:** [Lucide React](https://lucide.dev/)
## Project Structure
The project is organized into four main directories:
- `/src`: Contains the frontend React application, including pages, components, and hooks.
- `/worker`: Contains the Hono backend API running on a Cloudflare Worker, including routes and entity definitions for the Durable Object.
- `/ml-service`: Python ML service with FastAPI for batik pattern recognition (classification, similarity, explainability).
- `/notebooks`: Jupyter notebooks for ML model training and experimentation.
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

### Quick Start (Frontend & Worker)
To start the local development server, which includes both the Vite frontend and the Wrangler backend, run the following command:
```sh
npm install  # or bun install
npm run dev
```
This will:
- Start the Vite development server for the React frontend, typically on `http://localhost:3000`.
- Start the Wrangler development server for the Hono API.
- The frontend is configured to proxy API requests (`/api/*`) to the local worker, enabling seamless full-stack development.

### ML Service Setup (Optional - for AI features)

The ML service provides real batik pattern recognition with custom feature extraction.

**Quick Start:**
```sh
cd ml-service
./quickstart.sh
```

**Manual Setup:**
```sh
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure Kaggle credentials (for dataset download)
export KAGGLE_USERNAME=your_username
export KAGGLE_KEY=your_api_key
# Or copy .env.example to .env and edit

# Download dataset
python download_dataset.py

# Train model (run Jupyter notebook)
cd ../notebooks
jupyter notebook train_batik_classifier.ipynb
# Run all cells to download dataset and train model

# Start ML service
cd ../ml-service
./start.sh
```

The ML service will run on `http://localhost:8000`

**Features:**
- 🎨 **Color Analysis**: HSV/LAB histograms, dominant colors
- 🔍 **Texture Analysis**: Gabor filters, LBP, Haralick features
- 📐 **Geometry Analysis**: HOG, edge detection, line analysis
- 🤖 **Classification**: SVM + Random Forest ensemble (85-95% accuracy)
- 🔎 **Similarity Search**: Cosine similarity on 300+ feature vectors
- 💡 **Explainability**: Heatmap visualization of pattern focus

**Documentation:**
- [ML Service README](./ml-service/README.md) - Complete setup guide
- [Training Notebook](./notebooks/train_batik_classifier.ipynb) - Model training pipeline
- [Testing Guide](./ml-service/TESTING.md) - Testing & benchmarking
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
## Deployment

### Frontend & Worker (Cloudflare)
This application is designed for easy deployment to the Cloudflare global network.

1.  **Deploy to Cloudflare:**
    ```sh
    npm run build
    npm run deploy
    ```
    Or with one-click deployment:
    [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Maftuuh1922/warisan-digital)

### ML Service (Cloud Platform)

Deploy ML service to your preferred cloud platform:

**Option 1: Railway (Recommended)**
```sh
railway login
railway init
railway up
```

**Option 2: Render**
- Connect GitHub repo
- Deploy from `ml-service/` directory
- Add environment variables

**Option 3: Docker**
```sh
docker-compose up --build
```

**Complete deployment guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

### Environment Variables

**ML Service:**
- `KAGGLE_USERNAME` - Kaggle API username
- `KAGGLE_KEY` - Kaggle API key
- `PORT` - Service port (auto-set by platform)

**Worker:**
- `ML_SERVICE_URL` - URL of deployed ML service

Update in `worker/user-routes.ts`:
```typescript
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'https://your-ml-service.com';
```