# Key search email
KEY_EMAIL = "rp@fishmusicinc.com"

import requests
import csv
import time
from google.cloud import storage
import os

# Set the Google application credentials path
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/rsp_ms/.gcp/service_account.json"

platforms = [
    {"Platform": "Microsoft", "Login URL": "https://login.microsoftonline.com", "2FA": "enabled"},
    {"Platform": "Instagram", "Login URL": "https://www.instagram.com/accounts/login/", "2FA": "enabled"},
    {"Platform": "TikTok", "Login URL": "https://www.tiktok.com/login", "2FA": "needs setup"},
    {"Platform": "Bandcamp", "Login URL": "https://bandcamp.com/login", "2FA": "unknown"},
    {"Platform": "SoundCloud", "Login URL": "https://soundcloud.com/signin", "2FA": "unknown"},
    {"Platform": "Ko-fi", "Login URL": "https://ko-fi.com/home/login", "2FA": "unknown"},
    {"Platform": "Patreon", "Login URL": "https://www.patreon.com/login", "2FA": "enabled"},
    {"Platform": "Buy Me a Coffee", "Login URL": "https://www.buymeacoffee.com/login", "2FA": "unknown"},
    {"Platform": "Twitter", "Login URL": "https://twitter.com/login", "2FA": "enabled"},
    {"Platform": "Facebook", "Login URL": "https://www.facebook.com/login.php", "2FA": "enabled"},
    {"Platform": "YouTube", "Login URL": "https://accounts.google.com/ServiceLogin?service=youtube", "2FA": "enabled"},
    {"Platform": "LinkedIn", "Login URL": "https://www.linkedin.com/login", "2FA": "enabled"},
    {"Platform": "Reddit", "Login URL": "https://www.reddit.com/login", "2FA": "enabled"},
    {"Platform": "GitHub", "Login URL": "https://github.com/login", "2FA": "enabled"},
    {"Platform": "Dropbox", "Login URL": "https://www.dropbox.com/login", "2FA": "enabled"},
    {"Platform": "Google Drive", "Login URL": "https://accounts.google.com/ServiceLogin?service=wise", "2FA": "enabled"},
    {"Platform": "Zoom", "Login URL": "https://zoom.us/signin", "2FA": "enabled"},
    {"Platform": "Slack", "Login URL": "https://slack.com/signin", "2FA": "enabled"},
    {"Platform": "Discord", "Login URL": "https://discord.com/login", "2FA": "enabled"},
    # Add more platforms as needed
]

def check_platforms():
    results = []
    for p in platforms:
        try:
            response = requests.get(p["Login URL"], timeout=5)
            status = "✅ Online" if response.status_code == 200 else f"⚠️ {response.status_code}"
        except Exception as e:
            status = f"❌ Error: {e}"
        results.append({
            "Platform": p["Platform"],
            "Login Status": status,
            "2FA": p["2FA"]
        })
    return results

def save_sync_log(results, filepath="data/sync_log.csv"):
    if results:
        with open(filepath, "w", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
        print(f"📄 Sync log saved to {filepath}")

def sync_status():
    print("\n🔄 Platform Sync Status\n")
    results = check_platforms()
    for r in results:
        print(f"{r['Platform']}: {r['Login Status']} | 2FA: {r['2FA']}")
    save_sync_log(results)

def filter_results_by_email(results, email=KEY_EMAIL):
    # If results contain email field, filter by it
    filtered = [r for r in results if r.get("Email") == email]
    return filtered

def deep_email_summary(email=KEY_EMAIL):
    print(f"\n🔎 Deep Search for: {email}\n")
    results = check_platforms()
    # If platforms or results have email, show those
    filtered = filter_results_by_email(results, email)
    if filtered:
        for r in filtered:
            print(f"{r['Platform']}: {r['Login Status']} | 2FA: {r['2FA']}")
    else:
        print("No direct matches found in sync results.")
    print("\n(For deeper integration, connect account data sources with email fields.)\n")

def upload_to_gcs(local_path, bucket_name, remote_path):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(remote_path)
    blob.upload_from_filename(local_path)
    print(f"☁️ Synced {local_path} to gs://{bucket_name}/{remote_path}")

def print_platform_trace_csv():
    csv_path = 'data/platform_trace.csv'
    # Auto-create if missing
    if not os.path.exists('data'):
        os.makedirs('data')
    if not os.path.exists(csv_path):
        with open(csv_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=["Platform", "Status", "Details"])
            writer.writeheader()
        print(f"🆕 Created empty {csv_path}.")
    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)
        if rows:
            for row in rows:
                print(row)
        else:
            print(f"(No data in {csv_path})")

if __name__ == "__main__":
    print("\n--- Deep Email Sync ---\n")
    deep_email_summary()
    print("\n--- Platform Trace CSV ---\n")
    print_platform_trace_csv()
    local_csv = 'data/platform_trace.csv'
    # Always attempt upload, file is now guaranteed to exist
    try:
        upload_to_gcs(local_csv, 'fishmusic-cockpit-sink', 'platform_trace.csv')
    except Exception as e:
        print(f"❌ Upload failed: {e}")

# Install required packages
os.system("pip install -r requirements.txt")
chmod +x ~/NoizyFish_Aquarium/scripts/AutoSave_AutoRun.sh
~/NoizyFish_Aquarium/scripts/AutoSave_AutoRun.sh
