
import os
import time
from accounts import list_accounts


def show_dashboard(filepath=None):
	accounts = list_accounts()
	count = len(accounts)
	last_update = time.ctime(os.path.getmtime(os.path.join(os.path.dirname(__file__), 'data', 'account_alignment.csv')))
	print("\n=== NoizyCockPit Dashboard ===")
	print(f"Total Accounts: {count}")
	print(f"Last Update: {last_update}")
	print("============================\n")

branding_status = {
	"Instagram": {
		"Banner": "updated",
		"Bio": "needs update",
		"Profile Pic": "active"
	},
	"TikTok": {
		"Banner": "missing",
		"Bio": "active",
		"Profile Pic": "needs update"
	}
}

def show_branding():
	print("🎨 Branding Status Across Platforms:\n")
	for platform, status in branding_status.items():
		print(f"{platform}:")
		for item, state in status.items():
			print(f"  - {item}: {state}")
		print("")
