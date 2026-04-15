"""
Streamlit Admin Panel for Portfolio Website
"""
import streamlit as st
import requests
import json
from datetime import datetime
from typing import Optional, List, Dict, Any

import os
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

st.set_page_config(
    page_title="Portfolio Admin Panel",
    page_icon="⚙️",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    .main-header { font-size: 2.5rem; font-weight: bold; color: #1E88E5; margin-bottom: 1rem; }
    .section-header { font-size: 1.5rem; font-weight: bold; color: #424242; margin-top: 1rem; margin-bottom: 0.5rem; }
    .info-box { padding: 1rem; background-color: #E3F2FD; border-radius: 0.5rem; border-left: 4px solid #2196F3; }
    .stat-card { background-color: #FAFAFA; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #E0E0E0; text-align: center; }
    .stat-number { font-size: 2rem; font-weight: bold; color: #1E88E5; }
    .stat-label { font-size: 0.9rem; color: #757575; }
</style>
""", unsafe_allow_html=True)


# ========================
# API Helpers
# ========================

@st.cache_data(ttl=60)
def fetch_portfolio_data() -> Optional[Dict[str, Any]]:
    try:
        r = requests.get(f"{API_BASE_URL}/portfolio-data", timeout=10)
        if r.status_code == 200:
            return r.json()
        st.error(f"Failed to fetch data: {r.status_code}")
        return None
    except requests.exceptions.ConnectionError:
        st.error(f"Cannot connect to backend at {API_BASE_URL}. Please ensure the FastAPI server is running.")
        return None
    except Exception as e:
        st.error(f"Error: {str(e)}")
        return None


def save_portfolio_data(data: Dict[str, Any]) -> bool:
    try:
        r = requests.post(f"{API_BASE_URL}/admin-update", json=data, timeout=10)
        if r.status_code == 200:
            st.cache_data.clear()
            return True
        st.error(f"Failed to save: {r.status_code} - {r.text}")
        return False
    except Exception as e:
        st.error(f"Error saving: {str(e)}")
        return False


def upload_image(file) -> Optional[str]:
    """Upload image to backend and return the path"""
    try:
        r = requests.post(
            f"{API_BASE_URL}/upload-image",
            files={"file": (file.name, file.getvalue(), file.type)},
            timeout=15
        )
        if r.status_code == 200:
            return r.json().get("path")
        st.error(f"Upload failed: {r.text}")
        return None
    except Exception as e:
        st.error(f"Upload error: {str(e)}")
        return None




# ========================
# Sidebar
# ========================

def render_sidebar():
    st.sidebar.markdown("## ⚙️ Navigation")
    pages = ["📊 Dashboard", "🏠 Homepage", "👤 About", "💼 Projects",
             "🛠️ Skills", "🗂️ Experience", "🏅 Certificates", "📧 Contact", "⚡ Settings"]
    selected = st.sidebar.radio("Go to", pages, index=0)
    st.sidebar.markdown("---")
    st.sidebar.info(f"Backend: {API_BASE_URL}")
    return selected


# ========================
# Dashboard
# ========================

def render_dashboard(data: Dict[str, Any]):
    st.markdown('<p class="main-header">📊 Dashboard</p>', unsafe_allow_html=True)
    if not data:
        st.warning("No data available. Please ensure the backend is running.")
        return

    col1, col2, col3, col4 = st.columns(4)
    for col, label, key in zip(
        [col1, col2, col3, col4],
        ["Projects", "Skills", "Experience", "Contact"],
        ["projects", "skills", "experience", None]
    ):
        count = len(data.get(key, [])) if key else 1
        with col:
            st.markdown(f'<div class="stat-card"><div class="stat-number">{count}</div><div class="stat-label">{label}</div></div>', unsafe_allow_html=True)

    st.markdown("---")
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### Homepage Preview")
        hp = data.get("homepage", {})
        st.markdown(f'<div class="info-box"><strong>Name:</strong> {hp.get("name","N/A")}<br><strong>Subheading:</strong> {hp.get("subheading","N/A")}<br><strong>CTA:</strong> {hp.get("cta_text","N/A")}</div>', unsafe_allow_html=True)
    with col2:
        st.markdown("### Recent Projects")
        for p in data.get("projects", [])[:3]:
            st.markdown(f"- **{p.get('title','N/A')}**")


# ========================
# Homepage
# ========================

def render_homepage(data: Dict[str, Any], save_cb):
    st.markdown('<p class="section-header">🏠 Homepage Settings</p>', unsafe_allow_html=True)
    hp = data.get("homepage", {})

    with st.form("homepage_form"):
        col1, col2 = st.columns(2)
        with col1:
            name = st.text_input("Name", value=hp.get("name", ""))
            subheading = st.text_input("Subheading (use | to separate roles)", value=hp.get("subheading", ""))
            cta_text = st.text_input("CTA Button Text", value=hp.get("cta_text", ""))
        with col2:
            cta_email = st.text_input("CTA Email", value=hp.get("cta_email", ""))
            note_enabled = st.checkbox("Enable Note", value=hp.get("note_enabled", False))
            note_text = st.text_input("Note Text", value=hp.get("note_text", "") or "")

        st.markdown("---")
        st.markdown("**Status Badge** — the pulsing dot shown below your name on the homepage")
        col1, col2 = st.columns([1, 3])
        with col1:
            status_enabled = st.checkbox("Show Status Badge", value=hp.get("status_enabled", True))
        with col2:
            status_text = st.text_input(
                "Status Text",
                value=hp.get("status_text", "Available for opportunities"),
                disabled=not hp.get("status_enabled", True)
            )

        if st.form_submit_button("💾 Save Changes"):
            data["homepage"] = {
                "name": name, "subheading": subheading, "cta_text": cta_text,
                "cta_email": cta_email, "note_enabled": note_enabled, "note_text": note_text,
                "status_enabled": status_enabled, "status_text": status_text
            }
            if save_cb(data):
                st.success("✅ Homepage saved!")


# ========================
# About
# ========================

def render_about(data: Dict[str, Any], save_cb):
    st.markdown('<p class="section-header">👤 About Settings</p>', unsafe_allow_html=True)
    about = data.get("about", {})
    highlights = about.get("highlights", [])

    with st.form("about_form"):
        intro = st.text_area("Bio / Intro Text", value=about.get("intro", ""), height=150)
        contact_enabled = st.checkbox("Show Contact Links", value=about.get("contact_enabled", True))

        st.markdown("**Highlights** (one per line — shown as bullet points on the About section)")
        highlights_text = st.text_area(
            "Highlights",
            value="\n".join(highlights) if isinstance(highlights, list) else "",
            height=150,
            label_visibility="collapsed"
        )

        if st.form_submit_button("💾 Save Changes"):
            data["about"] = {
                "intro": intro,
                "contact_enabled": contact_enabled,
                "highlights": [h.strip() for h in highlights_text.splitlines() if h.strip()]
            }
            if save_cb(data):
                st.success("✅ About saved!")


# ========================
# Projects
# ========================

def render_projects(data: Dict[str, Any], save_cb):
    st.markdown('<p class="section-header">💼 Projects</p>', unsafe_allow_html=True)
    projects = data.get("projects", [])

    with st.expander("➕ Add New Project", expanded=False):
        st.markdown("**Project Image**")
        uploaded_file = st.file_uploader(
            "Drag & drop or click to upload image",
            type=["png", "jpg", "jpeg", "gif", "webp"],
            key="add_project_image"
        )
        add_image_url = None
        if uploaded_file:
            st.image(uploaded_file, width=200)
            if st.button("⬆️ Upload Image", key="upload_add_img"):
                path = upload_image(uploaded_file)
                if path:
                    st.session_state["add_project_image_url"] = path
                    st.success(f"✅ Uploaded: {path}")
        add_image_url = st.session_state.get("add_project_image_url", "")
        if add_image_url:
            st.caption(f"Image set: `{add_image_url}`")

        with st.form("add_project_form"):
            title = st.text_input("Title *")
            description = st.text_area("Description *", height=100)
            tech_stack = st.text_input("Tech Stack (comma separated)", placeholder="Python, FastAPI, React")
            github_url = st.text_input("GitHub URL")
            live_url = st.text_input("Live Demo URL")
            featured = st.checkbox("Featured")

            if st.form_submit_button("➕ Add Project") and title and description:
                projects.append({
                    "id": generate_id(),
                    "title": title,
                    "description": description,
                    "image_url": st.session_state.pop("add_project_image_url", None) or None,
                    "tech_stack": [t.strip() for t in tech_stack.split(",") if t.strip()],
                    "github_url": github_url or None,
                    "live_url": live_url or None,
                    "featured": featured,
                    "order": len(projects)
                })
                data["projects"] = projects
                if save_cb(data):
                    st.success("✅ Project added!")
                    st.rerun()

    st.markdown(f"### All Projects ({len(projects)})")

    if not projects:
        st.info("No projects yet.")
        return

    sorted_projects = sorted(projects, key=lambda p: p.get("order", 0))

    st.markdown("**Set display order** — lower number appears first. Click 💾 Save Order to apply.")
    order_map = {}
    for p in sorted_projects:
        order_map[p["id"]] = st.number_input(
            f"#{p.get('order', 0)}  {p.get('title', 'Untitled')}",
            min_value=0, value=p.get("order", 0), step=1,
            key=f"order_proj_{p['id']}"
        )
    if st.button("💾 Save Order", key="save_projects_order"):
        for p in projects:
            p["order"] = order_map[p["id"]]
        data["projects"] = projects
        if save_cb(data):
            st.success("✅ Project order saved!")
            st.rerun()

    st.markdown("---")

    for idx, project in enumerate(sorted_projects):
        orig_idx = next(i for i, p in enumerate(projects) if p["id"] == project["id"])
        with st.container():
            col1, col2, col3 = st.columns([4, 1, 1])
            with col1:
                st.markdown(f"**{project.get('title', 'Untitled')}**")
                st.caption(f"{project.get('description', '')[:80]}...")
                if project.get("tech_stack"):
                    st.markdown(f"🛠️ {', '.join(project.get('tech_stack', []))}")
            with col2:
                if st.button("✏️ Edit", key=f"edit_{idx}"):
                    st.session_state[f"edit_project_{orig_idx}"] = True
            with col3:
                if st.button("🗑️ Delete", key=f"delete_{idx}"):
                    st.session_state[f"confirm_delete_{orig_idx}"] = True

            if st.session_state.get(f"edit_project_{orig_idx}", False):
                st.markdown("**Update Image**")
                edit_uploaded = st.file_uploader(
                    "Drag & drop or click to replace image",
                    type=["png", "jpg", "jpeg", "gif", "webp"],
                    key=f"edit_img_{orig_idx}"
                )
                if edit_uploaded:
                    st.image(edit_uploaded, width=200)
                    if st.button("⬆️ Upload Image", key=f"upload_edit_img_{orig_idx}"):
                        path = upload_image(edit_uploaded)
                        if path:
                            st.session_state[f"edit_image_url_{orig_idx}"] = path
                            st.success(f"✅ Uploaded: {path}")

                current_image = st.session_state.get(f"edit_image_url_{orig_idx}", project.get("image_url", "") or "")
                if current_image:
                    st.caption(f"Current image: `{current_image}`")

                with st.form(f"edit_project_form_{orig_idx}"):
                    e_title = st.text_input("Title", value=project.get("title", ""))
                    e_desc = st.text_area("Description", value=project.get("description", ""), height=100)
                    e_tech = st.text_input("Tech Stack (comma separated)", value=",".join(project.get("tech_stack", [])))
                    e_github = st.text_input("GitHub URL", value=project.get("github_url", "") or "")
                    e_live = st.text_input("Live Demo URL", value=project.get("live_url", "") or "")
                    e_featured = st.checkbox("Featured", value=project.get("featured", False))

                    c1, c2 = st.columns(2)
                    with c1:
                        save = st.form_submit_button("💾 Save")
                    with c2:
                        cancel = st.form_submit_button("❌ Cancel")

                    if save:
                        projects[orig_idx] = {
                            "id": project.get("id"),
                            "title": e_title,
                            "description": e_desc,
                            "image_url": st.session_state.pop(f"edit_image_url_{orig_idx}", project.get("image_url")) or None,
                            "tech_stack": [t.strip() for t in e_tech.split(",") if t.strip()],
                            "github_url": e_github or None,
                            "live_url": e_live or None,
                            "featured": e_featured,
                            "order": project.get("order", 0)
                        }
                        data["projects"] = projects
                        if save_cb(data):
                            st.success("✅ Project updated!")
                            st.session_state[f"edit_project_{orig_idx}"] = False
                            st.rerun()
                    if cancel:
                        st.session_state[f"edit_project_{orig_idx}"] = False
                        st.rerun()

            if st.session_state.get(f"confirm_delete_{orig_idx}", False):
                st.warning(f"Delete '{project.get('title')}'?")
                c1, c2 = st.columns(2)
                with c1:
                    if st.button("✅ Confirm", key=f"confirm_{idx}"):
                        projects.pop(orig_idx)
                        data["projects"] = projects
                        if save_cb(data):
                            st.success("✅ Deleted!")
                            st.session_state[f"confirm_delete_{orig_idx}"] = False
                            st.rerun()
                with c2:
                    if st.button("❌ Cancel", key=f"cancel_{idx}"):
                        st.session_state[f"confirm_delete_{orig_idx}"] = False
                        st.rerun()

            st.markdown("---")


# ========================
# Skills
# ========================

def render_skills(data: Dict[str, Any], save_cb):
    st.markdown('<p class="section-header">🛠️ Skills</p>', unsafe_allow_html=True)
    skills = data.get("skills", [])

    with st.expander("➕ Add New Skill", expanded=False):
        with st.form("add_skill_form"):
            skill_name = st.text_input("Skill Name *")
            skill_category = st.text_input("Category *", placeholder="e.g., Frontend, Backend, AI/ML, DevOps")

            if st.form_submit_button("➕ Add Skill") and skill_name and skill_category:
                skills.append({
                    "id": generate_id(),
                    "name": skill_name,
                    "category": skill_category,
                    "logo": None,
                    "order": 0
                })
                data["skills"] = skills
                if save_cb(data):
                    st.success("✅ Skill added!")
                    st.rerun()

    st.markdown(f"### Skills by Category ({len(skills)})")

    if not skills:
        st.info("No skills yet.")
        return

    st.markdown("**Set display order** — lower number appears first within each category. Click 💾 Save Order to apply.")
    order_map = {}
    for s in sorted(skills, key=lambda x: (x.get("category", ""), x.get("order", 0))):
        order_map[s["id"]] = st.number_input(
            f"#{s.get('order', 0)}  [{s.get('category', '')}] {s.get('name', '')}",
            min_value=0, value=s.get("order", 0), step=1,
            key=f"order_skill_{s['id']}"
        )
    if st.button("💾 Save Order", key="save_skills_order"):
        for s in skills:
            s["order"] = order_map[s["id"]]
        data["skills"] = skills
        if save_cb(data):
            st.success("✅ Skill order saved!")
            st.rerun()

    st.markdown("---")

    skills_by_cat: Dict[str, List] = {}
    for s in skills:
        skills_by_cat.setdefault(s.get("category", "Other"), []).append(s)

    for category, cat_skills in sorted(skills_by_cat.items()):
        with st.expander(f"📁 {category} ({len(cat_skills)})", expanded=True):
            for skill in sorted(cat_skills, key=lambda x: x.get("order", 0)):
                col1, col2 = st.columns([5, 1])
                with col1:
                    st.markdown(f"**{skill.get('name', 'Untitled')}** — order: {skill.get('order', 0)}")
                with col2:
                    skill_idx = next((i for i, s in enumerate(skills) if s.get("id") == skill.get("id")), None)
                    if skill_idx is not None and st.button("🗑️", key=f"del_skill_{skill_idx}"):
                        skills.pop(skill_idx)
                        data["skills"] = skills
                        if save_cb(data):
                            st.success("✅ Skill deleted!")
                            st.rerun()


# ========================
# Experience
# ========================

def render_experience(data: Dict[str, Any], save_cb):
    st.markdown('<p class="section-header">🗂️ Experience</p>', unsafe_allow_html=True)
    experience = data.get("experience", [])

    with st.expander("➕ Add New Experience", expanded=False):
        with st.form("add_experience_form"):
            role = st.text_input("Role *")
            company = st.text_input("Company *")
            start_date = st.text_input("Start Date *", placeholder="e.g., 2022-06")
            end_date = st.text_input("End Date", placeholder="Leave empty if current")
            location = st.text_input("Location")
            is_current = st.checkbox("Currently working here")
            highlights_text = st.text_area("Highlights (one per line)", height=120,
                                           placeholder="Built X using Y\nImproved Z by 30%")

            if st.form_submit_button("➕ Add Experience") and role and company and start_date:
                experience.append({
                    "id": generate_id(),
                    "role": role,
                    "company": company,
                    "start_date": start_date,
                    "end_date": end_date or None,
                    "location": location or None,
                    "is_current": is_current,
                    "highlights": [h.strip() for h in highlights_text.splitlines() if h.strip()]
                })
                data["experience"] = experience
                if save_cb(data):
                    st.success("✅ Experience added!")
                    st.rerun()

    st.markdown(f"### All Experience ({len(experience)})")

    if not experience:
        st.info("No experience entries yet.")
        return

    for idx, exp in enumerate(experience):
        with st.container():
            col1, col2 = st.columns([4, 1])
            with col1:
                st.markdown(f"**{exp.get('role', 'Untitled')}** at *{exp.get('company', 'Unknown')}*")
                end = exp.get("end_date") or ("Present" if exp.get("is_current") else "N/A")
                st.caption(f"📅 {exp.get('start_date', '')} → {end}  |  📍 {exp.get('location', 'N/A')}")
                highlights = exp.get("highlights", [])
                if highlights:
                    st.markdown("• " + "  \n• ".join(highlights[:2]))
                    if len(highlights) > 2:
                        st.caption(f"+{len(highlights)-2} more highlights")
            with col2:
                if st.button("✏️ Edit", key=f"edit_exp_{idx}"):
                    st.session_state[f"edit_exp_{idx}"] = True
                if st.button("🗑️ Delete", key=f"delete_exp_{idx}"):
                    st.session_state[f"confirm_delete_exp_{idx}"] = True

            if st.session_state.get(f"edit_exp_{idx}", False):
                with st.form(f"edit_exp_form_{idx}"):
                    e_role = st.text_input("Role", value=exp.get("role", ""))
                    e_company = st.text_input("Company", value=exp.get("company", ""))
                    e_start = st.text_input("Start Date", value=exp.get("start_date", ""))
                    e_end = st.text_input("End Date", value=exp.get("end_date", "") or "")
                    e_location = st.text_input("Location", value=exp.get("location", "") or "")
                    e_current = st.checkbox("Currently working here", value=exp.get("is_current", False))
                    e_highlights = st.text_area(
                        "Highlights (one per line)",
                        value="\n".join(exp.get("highlights", [])),
                        height=120
                    )

                    c1, c2 = st.columns(2)
                    with c1:
                        save = st.form_submit_button("💾 Save")
                    with c2:
                        cancel = st.form_submit_button("❌ Cancel")

                    if save:
                        experience[idx] = {
                            "id": exp.get("id"),
                            "role": e_role,
                            "company": e_company,
                            "start_date": e_start,
                            "end_date": e_end or None,
                            "location": e_location or None,
                            "is_current": e_current,
                            "highlights": [h.strip() for h in e_highlights.splitlines() if h.strip()]
                        }
                        data["experience"] = experience
                        if save_cb(data):
                            st.success("✅ Experience updated!")
                            st.session_state[f"edit_exp_{idx}"] = False
                            st.rerun()
                    if cancel:
                        st.session_state[f"edit_exp_{idx}"] = False
                        st.rerun()

            if st.session_state.get(f"confirm_delete_exp_{idx}", False):
                st.warning(f"Delete '{exp.get('role')}' at '{exp.get('company')}'?")
                c1, c2 = st.columns(2)
                with c1:
                    if st.button("✅ Confirm", key=f"confirm_exp_{idx}"):
                        experience.pop(idx)
                        data["experience"] = experience
                        if save_cb(data):
                            st.success("✅ Deleted!")
                            st.session_state[f"confirm_delete_exp_{idx}"] = False
                            st.rerun()
                with c2:
                    if st.button("❌ Cancel", key=f"cancel_exp_{idx}"):
                        st.session_state[f"confirm_delete_exp_{idx}"] = False
                        st.rerun()

            st.markdown("---")


def generate_id() -> str:
    return datetime.now().strftime("%Y%m%d%H%M%S%f")


# ========================
# Certificates
# ========================

def render_certificates(data: Dict[str, Any], save_cb):
    st.markdown('<p class="section-header">🏅 Certificates</p>', unsafe_allow_html=True)

    enabled = data.get("certificates_enabled", True)
    new_enabled = st.toggle("Show Certificates section on portfolio", value=enabled)
    if new_enabled != enabled:
        data["certificates_enabled"] = new_enabled
        if save_cb(data):
            st.success(f"✅ Certificates section {'enabled' if new_enabled else 'disabled'}!")
            st.rerun()

    st.markdown("---")
    certificates = data.get("certificates", [])

    with st.expander("➕ Add New Certificate", expanded=False):
        with st.form("add_cert_form"):
            title = st.text_input("Certificate Title *")
            issuer = st.text_input("Issuer *", placeholder="e.g., Google, Coursera, AWS")
            date = st.text_input("Date", placeholder="e.g., Jan 2024")
            credential_url = st.text_input("Credential URL")
            description = st.text_area("Description", height=80)

            if st.form_submit_button("➕ Add Certificate") and title and issuer:
                certificates.append({
                    "id": generate_id(),
                    "title": title,
                    "issuer": issuer,
                    "date": date or None,
                    "credential_url": credential_url or None,
                    "description": description or None,
                    "order": len(certificates)
                })
                data["certificates"] = certificates
                if save_cb(data):
                    st.success("✅ Certificate added!")
                    st.rerun()

    st.markdown(f"### All Certificates ({len(certificates)})")
    if not certificates:
        st.info("No certificates yet.")
        return

    for idx, cert in enumerate(sorted(certificates, key=lambda c: c.get("order", 0))):
        orig_idx = next(i for i, c in enumerate(certificates) if c["id"] == cert["id"])
        with st.container():
            col1, col2, col3 = st.columns([4, 1, 1])
            with col1:
                st.markdown(f"**{cert.get('title', 'Untitled')}** — *{cert.get('issuer', '')}*")
                if cert.get("date"):
                    st.caption(cert["date"])
            with col2:
                if st.button("✏️ Edit", key=f"edit_cert_{idx}"):
                    st.session_state[f"edit_cert_{idx}"] = True
            with col3:
                if st.button("🗑️ Delete", key=f"delete_cert_{idx}"):
                    st.session_state[f"confirm_delete_cert_{idx}"] = True

            if st.session_state.get(f"edit_cert_{idx}", False):
                with st.form(f"edit_cert_form_{idx}"):
                    e_title = st.text_input("Title", value=cert.get("title", ""))
                    e_issuer = st.text_input("Issuer", value=cert.get("issuer", ""))
                    e_date = st.text_input("Date", value=cert.get("date", "") or "")
                    e_url = st.text_input("Credential URL", value=cert.get("credential_url", "") or "")
                    e_desc = st.text_area("Description", value=cert.get("description", "") or "", height=80)
                    c1, c2 = st.columns(2)
                    with c1:
                        save = st.form_submit_button("💾 Save")
                    with c2:
                        cancel = st.form_submit_button("❌ Cancel")
                    if save:
                        certificates[orig_idx] = {
                            "id": cert.get("id"),
                            "title": e_title, "issuer": e_issuer,
                            "date": e_date or None, "credential_url": e_url or None,
                            "description": e_desc or None, "order": cert.get("order", 0)
                        }
                        data["certificates"] = certificates
                        if save_cb(data):
                            st.success("✅ Certificate updated!")
                            st.session_state[f"edit_cert_{idx}"] = False
                            st.rerun()
                    if cancel:
                        st.session_state[f"edit_cert_{idx}"] = False
                        st.rerun()

            if st.session_state.get(f"confirm_delete_cert_{idx}", False):
                st.warning(f"Delete '{cert.get('title')}'?")
                c1, c2 = st.columns(2)
                with c1:
                    if st.button("✅ Confirm", key=f"confirm_cert_{idx}"):
                        certificates.pop(orig_idx)
                        data["certificates"] = certificates
                        if save_cb(data):
                            st.success("✅ Deleted!")
                            st.session_state[f"confirm_delete_cert_{idx}"] = False
                            st.rerun()
                with c2:
                    if st.button("❌ Cancel", key=f"cancel_cert_{idx}"):
                        st.session_state[f"confirm_delete_cert_{idx}"] = False
                        st.rerun()
            st.markdown("---")


# ========================
# Contact
# ========================

def render_contact(data: Dict[str, Any], save_cb):
    st.markdown('<p class="section-header">📧 Contact Settings</p>', unsafe_allow_html=True)
    contact = data.get("contact", {})

    with st.form("contact_form"):
        email = st.text_input("Email Address", value=contact.get("email", ""))
        linkedin = st.text_input("LinkedIn URL", value=contact.get("linkedin", "") or "")
        github = st.text_input("GitHub URL", value=contact.get("github", "") or "")

        if st.form_submit_button("💾 Save Changes"):
            data["contact"] = {
                "email": email,
                "linkedin": linkedin or None,
                "github": github or None
            }
            if save_cb(data):
                st.success("✅ Contact saved!")


# ========================
# Settings
# ========================

def render_settings():
    st.markdown('<p class="section-header">⚡ Settings</p>', unsafe_allow_html=True)

    st.markdown("### 📄 CV Upload")
    cv_file = st.file_uploader("Upload your CV (PDF only)", type=["pdf"])
    if cv_file:
        if st.button("⬆️ Upload CV"):
            try:
                r = requests.post(
                    f"{API_BASE_URL}/upload-cv",
                    files={"file": (cv_file.name, cv_file.getvalue(), "application/pdf")},
                    timeout=15
                )
                if r.status_code == 200:
                    st.success("✅ CV uploaded successfully! Users can now download it.")
                else:
                    st.error(f"Upload failed: {r.text}")
            except Exception as e:
                st.error(f"Error: {e}")

    st.markdown("---")
    st.markdown("""
    ### SMTP Configuration (Environment Variables)

    | Variable | Description | Default |
    |----------|-------------|---------|
    | `SMTP_HOST` | SMTP server hostname | smtp.gmail.com |
    | `SMTP_PORT` | SMTP server port | 587 |
    | `SMTP_USER` | SMTP username (email) | - |
    | `SMTP_PASSWORD` | SMTP password/app password | - |
    """)
    st.markdown("---")
    st.markdown("### API Endpoints Reference")
    st.markdown(f"""
    | Method | Endpoint | Description |
    |--------|----------|-------------|
    | GET | {API_BASE_URL}/portfolio-data | Fetch all portfolio data |
    | POST | {API_BASE_URL}/admin-update | Update portfolio data |
    | POST | {API_BASE_URL}/contact | Submit contact form |
    """)


# ========================
# Main
# ========================

def main():
    selected_page = render_sidebar()

    page_map = {
        "📊 Dashboard": "dashboard",
        "🏠 Homepage": "homepage",
        "👤 About": "about",
        "💼 Projects": "projects",
        "🛠️ Skills": "skills",
        "🗂️ Experience": "experience",
        "🏅 Certificates": "certificates",
        "📧 Contact": "contact",
        "⚡ Settings": "settings"
    }

    current_page = page_map.get(selected_page, "dashboard")
    st.markdown("---")

    data = fetch_portfolio_data()

    if current_page == "dashboard":
        render_dashboard(data)
    elif current_page == "homepage":
        render_homepage(data, save_portfolio_data)
    elif current_page == "about":
        render_about(data, save_portfolio_data)
    elif current_page == "projects":
        render_projects(data, save_portfolio_data)
    elif current_page == "skills":
        render_skills(data, save_portfolio_data)
    elif current_page == "experience":
        render_experience(data, save_portfolio_data)
    elif current_page == "certificates":
        render_certificates(data, save_portfolio_data)
    elif current_page == "contact":
        render_contact(data, save_portfolio_data)
    elif current_page == "settings":
        render_settings()


if __name__ == "__main__":
    main()
