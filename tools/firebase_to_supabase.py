import firebase_admin
from firebase_admin import credentials, firestore
from supabase import create_client, Client
import json

# --- CONFIGURATION ---
# 1. Download your Firebase Service Account JSON and put the path here
FIREBASE_SERVICE_ACCOUNT = "path/to/your-firebase-adminsdk.json"

# 2. Get your Supabase URL and Key
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-service-role-key" # USE SERVICE ROLE KEY FOR BYPASSING RLS

# --- INITIALIZATION ---
try:
    cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Initialized both Firebase and Supabase.")
except Exception as e:
    print(f"❌ Initialization error: {e}")
    print("Please update the configuration in the script.")
    exit()

def migrate_courses():
    print("🚀 Migrating Courses...")
    courses_ref = db.collection("courses").stream()
    for doc in courses_ref:
        data = doc.to_dict()
        course_id = doc.id

        supabase_data = {
            "title": data.get("title"),
            "slug": data.get("slug") or f"course-{course_id}",
            "category": data.get("category", "cake"),
            "price": data.get("price", 0),
            "discount": data.get("discount", 0),
            "level": data.get("level", "intermediate"),
            "status": data.get("status", "published"),
            "duration": data.get("duration"),
            "image_url": data.get("image"),
            "description": data.get("description"),
            "package_content": data.get("package", []),
            "seo_title": data.get("seoTitle"),
            "seo_description": data.get("seoDescription")
        }

        try:
            supabase.table("courses").insert(supabase_data).execute()
            print(f"   ✅ Migrated course: {data.get('title')}")
        except Exception as e:
            print(f"   ❌ Error migrating course {course_id}: {e}")

def migrate_gallery():
    print("🚀 Migrating Gallery...")
    gallery_ref = db.collection("gallery").stream()
    for doc in gallery_ref:
        data = doc.to_dict()

        supabase_data = {
            "url": data.get("url"),
            "category": data.get("category", "cake"),
            "created_at": data.get("createdAt").isoformat() if data.get("createdAt") else None
        }

        try:
            supabase.table("gallery").insert(supabase_data).execute()
            print(f"   ✅ Migrated gallery item")
        except Exception as e:
            print(f"   ❌ Error migrating gallery item: {e}")

if __name__ == "__main__":
    print("--- Dell Cake Data Migration Tool ---")
    # Uncomment the ones you want to run
    # migrate_courses()
    # migrate_gallery()
    print("--- Migration Finished ---")
