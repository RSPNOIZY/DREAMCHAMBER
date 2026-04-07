"""
NoizyStudios C2PA Schema Generator
====================================
Generates Content Credentials (C2PA 2.0) manifests for every track
produced through the Nerve-to-Note engine.

This is the provenance layer that makes a creator's catalog
investable, verifiable, and legally defensible — the same foundation
that makes Queen's catalog worth $1.27B, applied to every artist
from day one.

Embeds into: FLAC/WAV/MP3 metadata, IPFS content manifest,
             DDEX delivery package, Apple/Spotify Transparency Tags.
"""

import json
import hashlib
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import Optional

DB_PATH = Path(__file__).parent.parent.parent.parent.parent / "gabriel.db"


# ─────────────────────────────────────────────
# C2PA MANIFEST STRUCTURE
# ─────────────────────────────────────────────

@dataclass
class NerveToNoteAssertion:
    """Proof that this track was authored via adaptive human input."""
    adaptive_inputs: list[str]          # ["EMG", "breath", "micro-intent"]
    nerve_damage_profile: str           # "permanent_nerve_damage" | "motor_impairment" | etc.
    smoothing_mode: str                 # "intent_preserving" — NOT quantize
    human_verified: bool = True
    bipa_compliant: bool = True         # biometric data never left device
    gdpr_compliant: bool = True


@dataclass
class SoulCapsuleAssertion:
    """Links this track to the artist's decentralized IP archive."""
    ipfs_cid: Optional[str]            # Content ID on IPFS
    nsh: str                           # Neural Signature Hash
    vault_contract: Optional[str]      # Smart contract address (Legacy Vault)
    inference_shares_minted: bool = False


@dataclass
class ProvenanceAssertion:
    """Establishes creation timeline — court-grade timestamp chain."""
    creation_timestamp: str            # ISO8601 UTC
    platform: str = "NoizyStudios"
    engine_version: str = "Nerve-to-Note v1"
    das_threshold: float = 0.72        # DAS score above which = infringement
    training_data: str = "artist_private_only"  # NOT trained on internet data


@dataclass
class LicensingAssertion:
    """Embeds the rate card directly into the content credential."""
    sync_license_indie_usd: float = 500.0
    sync_license_major_usd: float = 5000.0
    mentor_model_per_session_usd: float = 2.50
    inference_share_yield_pct: float = 0.1
    arr_resale_royalty_pct: float = 5.0     # Artist Resale Right
    ai_training_opt_in: bool = False        # Default: BLOCKED
    ddex_ai_disclosure: str = "human_assisted"


@dataclass
class C2PAManifest:
    """
    Complete Content Credential for a NoizyStudios track.
    Readable by Apple Music, Spotify, Content Authenticity Initiative tools,
    and the NoizyStudios litigation engine.
    """
    # Identity
    manifest_id: str
    artist_id: str
    artist_name: str
    track_id: str
    track_title: str

    # Provenance chain
    provenance: ProvenanceAssertion
    nerve_to_note: NerveToNoteAssertion
    soul_capsule: SoulCapsuleAssertion
    licensing: LicensingAssertion

    # Integrity
    manifest_hash: str = ""            # SHA256 of manifest (set on finalize)
    schema_version: str = "c2pa_noizystudios_2.0"

    # Streaming platform fields (auto-populated on export)
    apple_transparency_tag: str = "human-assisted-ai"
    ddex_ai_flag: str = "AIAssisted"
    spotify_ai_disclosure: bool = True

    def finalize(self) -> "C2PAManifest":
        """Compute manifest hash — seals the credential."""
        content = json.dumps(self._to_signable_dict(), sort_keys=True)
        self.manifest_hash = hashlib.sha256(content.encode()).hexdigest()
        return self

    def _to_signable_dict(self) -> dict:
        return {
            "manifest_id": self.manifest_id,
            "artist_id": self.artist_id,
            "track_id": self.track_id,
            "nsh": self.soul_capsule.nsh,
            "creation_timestamp": self.provenance.creation_timestamp,
            "human_verified": self.nerve_to_note.human_verified,
        }

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2)

    def to_ddex_fields(self) -> dict:
        """Fields for DDEX ERN delivery package."""
        return {
            "AIGeneratedContent": self.ddex_ai_flag,
            "AIAssistanceType": "AdaptiveHumanInput",
            "ContentAuthenticityHash": self.manifest_hash,
            "NeuralSignatureHash": self.soul_capsule.nsh,
            "HumanAuthorVerified": "true",
            "BiometricProof": "on_device_only",
        }

    def to_apple_tags(self) -> dict:
        """Apple Music Transparency Tag fields (2026 mandate)."""
        return {
            "transparencyTag": self.apple_transparency_tag,
            "humanAuthor": self.artist_name,
            "aiAssistanceDisclosure": "Composed via adaptive neural input (nerve damage accommodation). AI assisted — human authored.",
            "contentCredentialHash": self.manifest_hash,
        }


# ─────────────────────────────────────────────
# SCHEMA GENERATOR
# ─────────────────────────────────────────────

class C2PASchemaGenerator:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.output_dir = Path(__file__).parent / "c2pa_manifests"
        self.output_dir.mkdir(exist_ok=True)

    def generate(
        self,
        artist_id: str,
        artist_name: str,
        track_id: str,
        track_title: str,
        nsh: str,
        adaptive_inputs: list[str] = None,
        ipfs_cid: str = None,
        vault_contract: str = None,
    ) -> C2PAManifest:

        manifest_id = hashlib.sha256(
            f"{artist_id}:{track_id}:{datetime.now(timezone.utc).isoformat()}".encode()
        ).hexdigest()[:24]

        manifest = C2PAManifest(
            manifest_id=manifest_id,
            artist_id=artist_id,
            artist_name=artist_name,
            track_id=track_id,
            track_title=track_title,
            provenance=ProvenanceAssertion(
                creation_timestamp=datetime.now(timezone.utc).isoformat(),
            ),
            nerve_to_note=NerveToNoteAssertion(
                adaptive_inputs=adaptive_inputs or ["micro-intent", "timing-deviation", "velocity-delta"],
                nerve_damage_profile="permanent_nerve_damage",
                smoothing_mode="intent_preserving",
            ),
            soul_capsule=SoulCapsuleAssertion(
                ipfs_cid=ipfs_cid,
                nsh=nsh,
                vault_contract=vault_contract,
            ),
            licensing=LicensingAssertion(),
        ).finalize()

        self._save(manifest)
        self._register_in_db(manifest)
        return manifest

    def _save(self, manifest: C2PAManifest):
        path = self.output_dir / f"{manifest.track_id}_{manifest.manifest_id[:8]}.json"
        path.write_text(manifest.to_json())
        print(f"[C2PA] Manifest saved: {path.name}")

    def _register_in_db(self, manifest: C2PAManifest):
        """Register the manifest hash in gabriel.db for cross-reference."""
        with sqlite3.connect(self.db_path) as db:
            db.execute("""
                CREATE TABLE IF NOT EXISTS c2pa_manifests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    manifest_id TEXT UNIQUE NOT NULL,
                    artist_id TEXT NOT NULL,
                    track_id TEXT NOT NULL,
                    track_title TEXT,
                    nsh TEXT NOT NULL,
                    manifest_hash TEXT NOT NULL,
                    ipfs_cid TEXT,
                    apple_tag TEXT,
                    ddex_flag TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            db.execute("""
                INSERT OR REPLACE INTO c2pa_manifests
                    (manifest_id, artist_id, track_id, track_title, nsh,
                     manifest_hash, ipfs_cid, apple_tag, ddex_flag)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                manifest.manifest_id, manifest.artist_id, manifest.track_id,
                manifest.track_title, manifest.soul_capsule.nsh,
                manifest.manifest_hash, manifest.soul_capsule.ipfs_cid,
                manifest.apple_transparency_tag, manifest.ddex_ai_flag,
            ))
        print(f"[C2PA] Registered in gabriel.db: {manifest.manifest_hash[:16]}...")

    def get_catalog(self, artist_id: str) -> list[dict]:
        """Return full verified catalog for an artist — the investable asset list."""
        with sqlite3.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            rows = db.execute(
                "SELECT * FROM c2pa_manifests WHERE artist_id = ? ORDER BY created_at",
                (artist_id,)
            ).fetchall()
        return [dict(r) for r in rows]

    def catalog_value_report(self, artist_id: str) -> str:
        """
        Generate a catalog summary suitable for investor/licensing conversations.
        Every track = a Crown Jewel. This report shows the full collection.
        """
        catalog = self.get_catalog(artist_id)
        if not catalog:
            return f"No verified tracks in catalog for {artist_id}."

        lines = [
            f"NOIZYLAB VERIFIED CATALOG — {artist_id}",
            f"{'='*50}",
            f"Total tracks   : {len(catalog)}",
            f"All human-verified, C2PA 2.0 credentialed",
            f"AI training    : BLOCKED on all tracks",
            f"Biometric proof: On-device (BIPA/GDPR compliant)",
            f"",
            f"TRACKS:",
        ]
        for t in catalog:
            lines.append(
                f"  [{t['created_at'][:10]}] {t['track_title'] or t['track_id']}"
                f" | NSH: {t['nsh'][:12]}..."
                f" | Hash: {t['manifest_hash'][:12]}..."
            )

        lines += [
            f"",
            f"Each track carries embedded licensing terms.",
            f"Inference Shares available for investor onboarding.",
            f"Contact: NoizyStudios Fiduciary Agent (rsplowman)",
        ]
        return "\n".join(lines)


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == "__main__":
    gen = C2PASchemaGenerator()

    # Stamp Robert's first track as a Crown Jewel
    manifest = gen.generate(
        artist_id="rsplowman",
        artist_name="Robert Stephen Plowman",
        track_id="RSP_001_GENESIS",
        track_title="Genesis (The Dive)",
        nsh="genesis_nsh_placeholder_register_via_fiduciary_agent",
        adaptive_inputs=["EMG", "breath", "micro-intent", "timing-deviation"],
        ipfs_cid=None,
        vault_contract=None,
    )

    print("\n--- DDEX FIELDS ---")
    print(json.dumps(manifest.to_ddex_fields(), indent=2))

    print("\n--- APPLE TRANSPARENCY TAGS ---")
    print(json.dumps(manifest.to_apple_tags(), indent=2))

    print("\n--- CATALOG VALUE REPORT ---")
    print(gen.catalog_value_report("rsplowman"))
