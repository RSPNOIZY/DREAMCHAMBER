
import csv
import os

ACCOUNTS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'account_alignment.csv')

def load_accounts():
	accounts = []
	if os.path.exists(ACCOUNTS_FILE):
		with open(ACCOUNTS_FILE, newline='') as csvfile:
			reader = csv.DictReader(csvfile)
			for row in reader:
				accounts.append(row)
	return accounts

def save_accounts(accounts):
	if accounts:
		fieldnames = accounts[0].keys()
		with open(ACCOUNTS_FILE, 'w', newline='') as csvfile:
			writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
			writer.writeheader()
			writer.writerows(accounts)

def add_account(account):
	accounts = load_accounts()
	accounts.append(account)
	save_accounts(accounts)

def edit_account(index, new_account):
	accounts = load_accounts()
	if 0 <= index < len(accounts):
		accounts[index] = new_account
		save_accounts(accounts)

def delete_account(index):
	accounts = load_accounts()
	if 0 <= index < len(accounts):
		accounts.pop(index)
		save_accounts(accounts)

def list_accounts():
	return load_accounts()

def export_accounts_to_csv():
	accounts = load_accounts()
	save_accounts(accounts)
