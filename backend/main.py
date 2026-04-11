"""
FastAPI Backend for Portfolio Website
Serves portfolio data and handles contact form submissions
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import json
import os
import httpx
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Portfolio API", version="1.0.0")

# File paths
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
_writable = "/tmp" if not os.access(DATA_DIR, os.W_OK) else DATA_DIR
DATA_FILE = os.path.join(_writable, "portfolio_data.json")
UPLOADS_DIR = os.path.join(_writable, "uploads")
CV_DIR = os.path.join(_writable, "cv")
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(CV_DIR, exist_ok=True)
_bundled = os.path.join(DATA_DIR, "portfolio_data.json")
if not os.path.exists(DATA_FILE) and os.path.exists(_bundled):
    import shutil
    shutil.copy(_bundled, DATA_FILE)

# Serve uploaded images as static files
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# CORS
_frontend_url = os.getenv("FRONTEND_URL", "*")
ALLOWED_ORIGINS = ["*"] if _frontend_url == "*" else [_frontend_url, "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class Project(BaseModel):
    id: str
    title: str
    description: str
    image_url: Optional[str] = None
    tech_stack: List[str] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: bool = False
    order: int = 0

class Skill(BaseModel):
    id: str
    name: str
    category: str
    logo: Optional[str] = None
    order: int = 0

class Experience(BaseModel):
    id: str
    role: str
    company: str
    start_date: str
    end_date: Optional[str] = None
    location: Optional[str] = None
    is_current: bool = False
    highlights: List[str] = []

class ContactConfig(BaseModel):
    email: str
    linkedin: Optional[str] = None
    github: Optional[str] = None

class HomepageConfig(BaseModel):
    name: str
    subheading: str
    cta_text: str
    cta_email: str
    note_enabled: bool = False
    note_text: Optional[str] = None
    status_enabled: bool = True
    status_text: str = "Available for opportunities"

class AboutConfig(BaseModel):
    intro: str
    contact_enabled: bool = True
    highlights: List[str] = []

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str
    ip_address: Optional[str] = None
    location: Optional[str] = None
    isp: Optional[str] = None
    visitor_ip: Optional[str] = None

class PortfolioData(BaseModel):
    homepage: HomepageConfig
    about: AboutConfig
    contact: ContactConfig
    projects: List[Project] = []
    skills: List[Skill] = []
    experience: List[Experience] = []

# --- Helper Functions ---
def migrate_project(p: dict) -> dict:
    """Migrate old project field names to new ones"""
    return {
        "id": p.get("id", ""),
        "title": p.get("title", ""),
        "description": p.get("description") or p.get("full_description") or p.get("short_description", ""),
        "image_url": p.get("image_url") or (p.get("image") if p.get("image", "").startswith("/") or p.get("image", "").startswith("http") else None),
        "tech_stack": p.get("tech_stack", []),
        "github_url": p.get("github_url") or p.get("github_link"),
        "live_url": p.get("live_url") or p.get("live_link"),
        "featured": p.get("featured", False),
        "order": p.get("order", 0),
    }

def migrate_experience(e: dict) -> dict:
    """Migrate old experience field names to new ones"""
    return {
        "id": e.get("id", ""),
        "role": e.get("role", ""),
        "company": e.get("company", ""),
        "start_date": e.get("start_date") or e.get("duration", ""),
        "end_date": e.get("end_date"),
        "location": e.get("location"),
        "is_current": e.get("is_current", not bool(e.get("end_date"))),
        "highlights": e.get("highlights") or ([e["description"]] if e.get("description") else []),
    }

def load_data() -> PortfolioData:
    """Load portfolio data from JSON file, migrating old field names if needed"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r") as f:
                raw = json.load(f)

            # Migrate projects
            raw["projects"] = [migrate_project(p) for p in raw.get("projects", [])]
            # Migrate experience
            raw["experience"] = [migrate_experience(e) for e in raw.get("experience", [])]
            # Ensure about has highlights
            if "about" in raw and "highlights" not in raw["about"]:
                raw["about"]["highlights"] = []

            return PortfolioData(**raw)
    except Exception as e:
        logger.error(f"Error loading data: {e}")
    return get_default_data()

def save_data(data: PortfolioData):
    """Save portfolio data to JSON file"""
    with open(DATA_FILE, "w") as f:
        json.dump(data.model_dump(), f, indent=2)

def get_default_data() -> PortfolioData:
    """Return default portfolio data"""
    return PortfolioData(
        homepage=HomepageConfig(
            name="PRIYANSH",
            subheading="Full Stack Developer | AI Enthusiast",
            cta_text="Let's Work Together",
            cta_email="priyansh@example.com",
            note_enabled=False,
            note_text=""
        ),
        about=AboutConfig(
            intro="Passionate developer creating innovative solutions.",
            contact_enabled=True,
            highlights=[]
        ),
        contact=ContactConfig(
            email="priyansh@example.com",
            linkedin="https://linkedin.com/in/priyansh",
            github="https://github.com/priyansh"
        ),
        projects=[],
        skills=[],
        experience=[]
    )

def send_email(to_email: str, subject: str, body: str):
    """Send email via SMTP"""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_user or not smtp_password:
        logger.warning("SMTP credentials not configured")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Email error: {e}")
        return False

# --- API Endpoints ---
@app.get("/")
async def root():
    return {"message": "Portfolio API", "version": "1.0.0"}

@app.get("/portfolio-data")
async def get_portfolio_data():
    """Get all portfolio data"""
    return load_data()

async def get_location_from_ip(ip: str) -> dict:
    """Lookup location info from IP using ip-api.com"""
    try:
        # Skip lookup for private/local IPs
        if not ip or ip in ("127.0.0.1", "::1") or ip.startswith("192.168.") or ip.startswith("10."):
            return {}
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"http://ip-api.com/json/{ip}?fields=status,query,city,regionName,country,zip,lat,lon,isp,org")
            data = r.json()
            return data if data.get("status") == "success" else {}
    except Exception as e:
        logger.warning(f"IP lookup failed: {e}")
        return {}

@app.post("/contact")
async def submit_contact(form: ContactForm, request: Request):
    """Handle contact form submission"""
    # Get real client IP — prefer X-Forwarded-For, fallback to visitor_ip sent from frontend
    detected_ip = (
        request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        or request.headers.get("X-Real-IP", "")
        or (request.client.host if request.client else "")
    )
    is_local = not detected_ip or detected_ip in ("127.0.0.1", "::1") or detected_ip.startswith(("192.168.", "10.", "172."))
    client_ip = (form.visitor_ip if is_local else detected_ip) or detected_ip

    geo = await get_location_from_ip(client_ip)
    location_str = ", ".join(filter(None, [
        geo.get("city"), geo.get("regionName"), geo.get("zip"), geo.get("country")
    ])) or form.location or "Not available"
    isp_str = " / ".join(filter(None, [geo.get("isp"), geo.get("org")])) or form.isp or "Not available"
    lat_lon = f"{geo['lat']}, {geo['lon']}" if geo.get("lat") and geo.get("lon") else "N/A"

    data = load_data()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    email_body = f"""
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> {form.name}</p>
    <p><strong>Email:</strong> {form.email}</p>
    <p><strong>Message:</strong></p>
    <p>{form.message}</p>
    <hr>
    <p><strong>Timestamp:</strong> {timestamp}</p>
    <p><strong>IP Address:</strong> {client_ip or 'Not available'}</p>
    <p><strong>Location:</strong> {location_str}</p>
    <p><strong>Coordinates:</strong> {lat_lon}</p>
    <p><strong>ISP / Org:</strong> {isp_str}</p>
    """

    success = send_email(
        data.contact.email,
        f"Portfolio Contact: {form.name}",
        email_body
    )

    return {"success": True, "message": "Message sent successfully" if success else "Message received (email notification pending)"}

@app.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    """Upload CV file (PDF)"""
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    cv_path = os.path.join(CV_DIR, "cv.pdf")
    contents = await file.read()
    with open(cv_path, "wb") as f:
        f.write(contents)
    return {"success": True}

@app.get("/download-cv")
async def download_cv():
    """Download the uploaded CV"""
    cv_path = os.path.join(CV_DIR, "cv.pdf")
    if not os.path.exists(cv_path):
        raise HTTPException(status_code=404, detail="CV not available")
    return FileResponse(cv_path, media_type="application/pdf", filename="CV.pdf")

@app.get("/projects")
async def get_projects():
    """Get all projects"""
    data = load_data()
    return data.projects

@app.post("/admin-update")
async def update_portfolio(new_data: PortfolioData):
    """Update portfolio data"""
    try:
        save_data(new_data)
        return {"success": True, "message": "Portfolio updated successfully"}
    except Exception as e:
        logger.error(f"Update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Handle image upload"""
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".png"
    if ext not in [".png", ".jpg", ".jpeg", ".gif", ".webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    new_filename = f"{timestamp}{ext}"
    filepath = os.path.join(UPLOADS_DIR, new_filename)

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    return {"success": True, "filename": new_filename, "path": f"/uploads/{new_filename}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
