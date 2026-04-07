import os
import json

REQUIRED_FILES = ["credentials.json", "service_account.json"]
REQUIRED_SCOPE = "https://www.googleapis.com/auth/gmail.readonly"


def check_files():
    found = False
    for fname in REQUIRED_FILES:
        if os.path.exists(fname):
            print(f"✅ Found: {fname}")
            found = True
            if fname == "credentials.json":
                with open(fname) as f:
                    creds = json.load(f)
                    scopes = creds.get("installed", {}).get("redirect_uris", [])
                    print(f"    Redirect URIs: {scopes}")
            if fname == "service_account.json":
                with open(fname) as f:
                    creds = json.load(f)
                    print(f"    Service Account: {creds.get('client_email')}")
        else:
            print(f"❌ Missing: {fname}")
    if not found:
        print("⚠️ No credentials found. Please add credentials.json or service_account.json.")
    return found

def check_gmail_scope():
    if os.path.exists("credentials.json"):
        with open("credentials.json") as f:
            creds = json.load(f)
            scopes = creds.get("installed", {}).get("scopes", [])
            if REQUIRED_SCOPE in scopes:
                print(f"✅ Gmail API scope present in credentials.json")
            else:
                print(f"❌ Gmail API scope missing in credentials.json")
    else:
        print("⚠️ credentials.json not found for scope check.")

if __name__ == "__main__":
    print("\n--- Permission Check ---\n")
    files_ok = check_files()
    check_gmail_scope()
    if files_ok:
        print("\nYou are ready to run inbox_scan.py!\n")
    else:
        print("\nPlease fix missing credentials before running inbox_scan.py.\n")
