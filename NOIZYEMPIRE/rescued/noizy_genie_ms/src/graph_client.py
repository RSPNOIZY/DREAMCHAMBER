import os
import time
import requests
import msal

GRAPH_BASE = "https://graph.microsoft.com/v1.0"

SCOPES = [
    "Files.ReadWrite.All",
    "Sites.Read.All",
    "Mail.Read",
    "Mail.ReadWrite",
    "offline_access",
]

class GraphClient:
    def __init__(self, tenant_id: str, client_id: str, client_secret: str, user_email: str):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.user_email = user_email
        self.app = msal.ConfidentialClientApplication(
            client_id,
            authority=f"https://login.microsoftonline.com/{tenant_id}",
            client_credential=client_secret,
        )
        self._token = None
        self._token_exp = 0

    def _get_token(self):
        now = time.time()
        if self._token and now < self._token_exp - 60:
            return self._token
        result = self.app.acquire_token_for_client(scopes=[f"{s}" for s in SCOPES])
        if "access_token" not in result:
            raise RuntimeError(f"Token acquisition failed: {result}")
        self._token = result["access_token"]
        self._token_exp = now + result.get("expires_in", 300)
        return self._token

    def _headers(self):
        return {"Authorization": f"Bearer {self._get_token()}"}

    def me_drive(self):
        r = requests.get(f"{GRAPH_BASE}/me/drive", headers=self._headers())
        r.raise_for_status()
        return r.json()

    def ensure_folder(self, path_segments):
        parent_id = "root"
        for segment in path_segments:
            url = f"{GRAPH_BASE}/me/drive/items/{parent_id}/children"
            r = requests.get(url, headers=self._headers(), params={"$select": "id,name"})
            r.raise_for_status()
            children = r.json().get("value", [])
            existing = next((c for c in children if c["name"] == segment), None)
            if existing:
                parent_id = existing["id"]
                continue
            create_url = f"{GRAPH_BASE}/me/drive/items/{parent_id}/children"
            body = {"name": segment, "folder": {}, "@microsoft.graph.conflictBehavior": "rename"}
            cr = requests.post(create_url, headers=self._headers(), json=body)
            cr.raise_for_status()
            parent_id = cr.json()["id"]
        return parent_id

    def search_drive(self, query):
        r = requests.get(f"{GRAPH_BASE}/me/drive/root/search(q='{query}')", headers=self._headers())
        r.raise_for_status()
        return r.json().get("value", [])

    def move_item(self, item_id, dest_parent_id):
        url = f"{GRAPH_BASE}/me/drive/items/{item_id}"
        body = {"parentReference": {"id": dest_parent_id}}
        r = requests.patch(url, headers=self._headers(), json=body)
        r.raise_for_status()
        return r.json()

    def list_messages(self, top=50):
        url = f"{GRAPH_BASE}/me/messages"
        r = requests.get(url, headers=self._headers(), params={"$top": top, "$select": "id,subject,hasAttachments"})
        r.raise_for_status()
        return r.json().get("value", [])

    def list_attachments(self, message_id):
        url = f"{GRAPH_BASE}/me/messages/{message_id}/attachments"
        r = requests.get(url, headers=self._headers())
        r.raise_for_status()
        return r.json().get("value", [])
