
import sys
import time

def fire_ascii_art():
    print(r"""
   ____  _            _     _           _   _     _       _   _     _   
  |  _ \| |          | |   | |         | | | |   (_)     | | | |   | |  
  | |_) | | ___   ___| | __| | ___ _ __| |_| |__  _ _ __ | |_| |__ | |_ 
  |  _ <| |/ _ \ / __| |/ _` |/ _ \ '__| __| '_ \| | '_ \| __| '_ \| __|
  | |_) | | (_) | (__| | (_| |  __/ |  | |_| | | | | | | | |_| | | | |_ 
  |____/|_|\___/ \___|_|\__,_|\___|_|   \__|_| |_|_|_| |_|\__|_| |_|\__|
    """
    )
    print("\nWelcome to NoizyCockPit! Hit me with your best shot!\n")



def main_menu():
    print("What would you like to do?")
    print("1. View Dashboard")
    print("2. List Accounts")
    print("3. Add Account")
    print("4. Edit Account")
    print("5. Delete Account")
    print("6. Export Accounts to CSV")
    print("7. Sync Platform Status")
    print("8. Exit")
    choice = input("Enter your choice (1-8): ")
    return choice


from dashboard import show_dashboard
from accounts import list_accounts, add_account, edit_account, delete_account, export_accounts_to_csv
from config import ACCOUNT_FIELDS
from utils import validate_account


from sync import sync_status

def main():
    fire_ascii_art()
    while True:
        choice = main_menu()
        if choice == '1':
            show_dashboard()
        elif choice == '2':
            accounts = list_accounts()
            print("\nAccounts:")
            for i, acc in enumerate(accounts):
                print(f"{i+1}. {acc}")
            print()
        elif choice == '3':
            print("\nAdd Account:")
            account = {field: input(f"{field}: ") for field in ACCOUNT_FIELDS}
            if validate_account(account, ACCOUNT_FIELDS):
                add_account(account)
                print("Account added!\n")
            else:
                print("Invalid account data.\n")
        elif choice == '4':
            accounts = list_accounts()
            idx = int(input("Enter account number to edit: ")) - 1
            if 0 <= idx < len(accounts):
                print("Enter new details:")
                new_account = {field: input(f"{field}: ") for field in ACCOUNT_FIELDS}
                if validate_account(new_account, ACCOUNT_FIELDS):
                    edit_account(idx, new_account)
                    print("Account updated!\n")
                else:
                    print("Invalid account data.\n")
            else:
                print("Invalid account number.\n")
        elif choice == '5':
            accounts = list_accounts()
            idx = int(input("Enter account number to delete: ")) - 1
            if 0 <= idx < len(accounts):
                delete_account(idx)
                print("Account deleted!\n")
            else:
                print("Invalid account number.\n")
        elif choice == '6':
            export_accounts_to_csv()
            print("Accounts exported to CSV!\n")
        elif choice == '7':
            sync_status()
        elif choice == '8':
            print("Goodbye! Stay Noizy!")
            time.sleep(1)
            sys.exit(0)
        else:
            print("Invalid choice. Please try again.\n")

if __name__ == "__main__":
    main()
