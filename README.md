# Portfolio Project

A production-ready 3D developer portfolio with a Glass design system, featuring a React frontend, FastAPI backend, and Streamlit admin panel.

# **Features**

- **Glass Design System** - Apple-inspired glassmorphism with blur, transparency, and reflections
- **3D Interactions** - Three.js powered backgrounds, 3D card tilts, and animated transitions
- **Dark/Light Mode** - Smooth theme toggle with persistent preference
- **Responsive Design** - Mobile-first approach with desktop enhancements
- **Admin Panel** - Streamlit-powered CMS for all content management
- **Email Integration** - Contact form with SMTP email delivery
- **Real-time Updates** - All changes reflected immediately via API

# **Tech Stack**

## **Frontend**
- React 18
- Three.js / React Three Fiber
- Tailwind CSS
- Framer Motion
- Axios

## **Backend**
- FastAPI
- Pydantic
- Uvicorn

## **Admin**
- Streamlit
- Requests

# **Project Structure**

```
portfolio-project/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/           # Page sections
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── styles/          # CSS styles
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   └── package.json
├── backend/
│   ├── main.py             # FastAPI application
│   ├── portfolio_data.json # Data storage
│   └── requirements.txt
├── admin/
│   └── app.py              # Streamlit admin panel
├── requirements.txt        # Root dependencies
└── README.md
```

# **Setup Instructions**

## **Prerequisites**
- Node.js 18+
- Python 3.10+
- npm or yarn

## **Backend Setup**

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (create `.env` file):
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

5. Run the backend:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The API will be available at `http://localhost:8000`

## **Frontend Setup**

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## **Admin Panel Setup**

1. Ensure backend is running on port 8000

2. Install admin dependencies:
   ```bash
   pip install streamlit requests
   ```

3. Run Streamlit:
   ```bash
   cd admin
   streamlit run app.py
   ```

The admin panel will be available at `http://localhost:8501`

# **API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/portfolio-data` | Get all portfolio data |
| POST | `/contact` | Submit contact form |
| GET | `/projects` | Get all projects |
| POST | `/admin-update` | Update portfolio data |
| POST | `/upload-image` | Upload image file |

# **Deployment**

## **Backend (Railway/Render/Heroku)**
1. Set environment variables
2. Deploy with `uvicorn main:app --host 0.0.0.0 --port $PORT`

## **Frontend (Vercel/Netlify)**
1. Set `VITE_API_URL` to production backend URL
2. Deploy build output

## **Admin (Streamlit Cloud)**
1. Connect to GitHub repository
2. Set backend URL in app configuration

# **Environment Variables**

## **Backend (.env)**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## **Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
```

# **License**

MIT License - Feel free to use this project for your own portfolio.
