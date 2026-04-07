
# Helpers (e.g., filters, validators) for NoizyCockPit

def filter_accounts(accounts, key, value):
	return [acc for acc in accounts if acc.get(key) == value]

def validate_account(account, required_fields):
	return all(account.get(field) for field in required_fields)
