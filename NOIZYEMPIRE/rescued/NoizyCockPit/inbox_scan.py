

import os, csv
from google.oauth2 import service_account
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.cloud import storage

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
DATA_DIR = 'data'
LOG_FILE = os.path.join(DATA_DIR, 'inbox_scan_log.csv')
BUCKET = 'fishmusic-cockpit-sink'
DELEGATED_EMAIL = 'YOUR_EMAIL@gmail.com'  # <-- Replace with your Gmail address

def get_gmail_service():
    path = os.path.expanduser('~/.gcp/service_account.json')
    if os.path.exists(path):
        creds = service_account.Credentials.from_service_account_file(path, scopes=SCOPES)
        delegated = creds.with_subject(DELEGATED_EMAIL)
        print("🔑 Using service account credentials.")
        return build('gmail', 'v1', credentials=delegated)
    elif os.path.exists('credentials.json'):
        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
        creds = flow.run_local_server(port=0)
        print("🔑 Using OAuth credentials.json.")
        return build('gmail', 'v1', credentials=creds)
    else:
        raise FileNotFoundError("No credentials found. Please add service_account.json or credentials.json.")

def scan_inbox(service, max_results=100):
    print("📥 Scanning inbox...")
    results = service.users().messages().list(userId='me', maxResults=max_results).execute()
    messages = results.get('messages', [])
    rows = []
    for msg in messages:
        msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
        headers = msg_data['payload'].get('headers', [])
        subject = sender = date = ''
        for h in headers:
            if h['name'] == 'Subject': subject = h['value']
            elif h['name'] == 'From': sender = h['value']
            elif h['name'] == 'Date': date = h['value']
        rows.append([sender, subject, date])
    print(f"✅ Fetched {len(rows)} messages.")
    return rows

def save_to_csv(rows):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(LOG_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Sender', 'Subject', 'Date'])
        writer.writerows(rows)
    print(f"✅ Saved {len(rows)} messages to {LOG_FILE}")

def upload_to_gcs(local_path, bucket_name, remote_path):
    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(remote_path)
        blob.upload_from_filename(local_path)
        print(f"☁️ Synced {local_path} to gs://{bucket_name}/{remote_path}")
    except Exception as e:
        print(f"❌ Upload failed: {e}")

if __name__ == '__main__':
    try:
        service = get_gmail_service()
        rows = scan_inbox(service)
        save_to_csv(rows)
        upload_to_gcs(LOG_FILE, BUCKET, 'inbox_scan_log.csv')
    except Exception as e:
        print(f"❌ Error: {e}")
