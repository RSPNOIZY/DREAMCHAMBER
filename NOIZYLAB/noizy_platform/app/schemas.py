from datetime import datetime

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    timestamp: str


class AVAProfileCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=64)
    display_name: str = Field(min_length=2, max_length=128)
    voice_provider: str = Field(default="piper")
    stt_provider: str = Field(default="whisper")
    tone_preset: str = Field(default="neutral")


class AVAProfileRead(BaseModel):
    id: int
    slug: str
    display_name: str
    voice_provider: str
    stt_provider: str
    tone_preset: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComposerCreate(BaseModel):
    handle: str = Field(min_length=2, max_length=64)
    display_name: str = Field(min_length=2, max_length=128)
    specialties: str = Field(default="")


class ComposerRead(BaseModel):
    id: int
    handle: str
    display_name: str
    status: str
    specialties: str
    joined_at: datetime

    class Config:
        from_attributes = True


class TeacherRead(BaseModel):
    composer_id: int
    track: str
    promoted_at: datetime

    class Config:
        from_attributes = True


class MediaIngestCreate(BaseModel):
    media_type: str = Field(min_length=2, max_length=32)
    source_uri: str = Field(min_length=4, max_length=512)
    created_by: str = Field(default="system")
    notes: str = Field(default="")


class MediaIngestRead(BaseModel):
    id: int
    media_type: str
    source_uri: str
    created_by: str
    status: str
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True


class TranscribeRequest(BaseModel):
    input_path: str = Field(min_length=2, max_length=512)


class TranscribeResponse(BaseModel):
    provider: str
    input_path: str
    transcript: str


class SynthesizeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    voice_id: str = Field(default="default")
    output_path: str = Field(default="output.wav")


class SynthesizeResponse(BaseModel):
    provider: str
    output_path: str
    detail: str


class OrchestrateRequest(BaseModel):
    event: str = Field(min_length=2, max_length=64)
    payload: dict = Field(default_factory=dict)


class GenericMessage(BaseModel):
    message: str


class ActorJourneyStep(BaseModel):
    key: str
    title: str
    summary: str


class ActorJourneyPathway(BaseModel):
    mission: str
    steps: list[ActorJourneyStep]


class ActorJourneyProgressUpsert(BaseModel):
    step_key: str = Field(min_length=2, max_length=64)
    status: str = Field(default="in_progress")
    notes: str = Field(default="")


class ActorJourneyProgressRead(BaseModel):
    id: int
    ava_id: int
    step_key: str
    status: str
    notes: str
    updated_at: datetime

    class Config:
        from_attributes = True


class CommunityStarterTask(BaseModel):
    key: str
    title: str
    why: str
    action: str


class CommunityStarterPack(BaseModel):
    title: str
    objective: str
    first_7_days: list[CommunityStarterTask]
    support_channels: list[str]


class OnboardingInitializeResponse(BaseModel):
    ava_slug: str
    created_steps: int
    existing_steps: int
    next_action: str


class ActorLaunchJourneyPhase(BaseModel):
    phase: str
    outcome: str
    key_actions: list[str]


class ActorLaunchJourneyMap(BaseModel):
    title: str
    promise: str
    phases: list[ActorLaunchJourneyPhase]


class AudioUploadResponse(BaseModel):
    asset_id: int
    ava_slug: str
    original_filename: str
    duration_seconds: int
    sample_rate: int
    channels: int
    segments_processed: int
    feature_backend: str
    transcript_excerpt: str
    quality_profile: str
    analysis_wav_path: str
    archival_wav_path: str
    immersive_wav_path: str
    quality_report: dict
    use_profile_updated: bool


class AudioAssetRead(BaseModel):
    id: int
    ava_id: int
    original_filename: str
    stored_path: str
    normalized_wav_path: str
    archival_wav_path: str
    immersive_wav_path: str
    duration_seconds: int
    sample_rate: int
    channels: int
    quality_profile: str
    quality_report_json: str
    transcript_excerpt: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UseProfileRead(BaseModel):
    ava_slug: str
    profile: dict


class AudioAssetQualityRead(BaseModel):
    asset_id: int
    original_filename: str
    quality_profile: str
    analysis_wav_path: str
    archival_wav_path: str
    immersive_wav_path: str
    duration_seconds: int
    sample_rate: int
    channels: int
    created_at: datetime


class QualityReportRead(BaseModel):
    ava_slug: str
    profile: dict
    assets: list[AudioAssetQualityRead]


# ─── NOIZYVOX — Voice Ownership & 75/25 Split Engine ─────────────────────────

class VoiceModelCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=64)
    display_name: str = Field(min_length=2, max_length=128)
    owner_handle: str = Field(min_length=2, max_length=64)


class VoiceModelRead(BaseModel):
    id: int
    slug: str
    display_name: str
    owner_handle: str
    status: str
    creator_share: float
    platform_share: float
    xtts_checkpoint_path: str
    voice_fingerprint_json: str
    activated_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class VoiceCloneRequest(BaseModel):
    voice_model_slug: str = Field(min_length=2, max_length=64)
    # list of local wav paths already uploaded to the server
    sample_paths: list[str] = Field(min_length=1)
    language: str = Field(default="en")


class VoiceCloneResponse(BaseModel):
    voice_model_slug: str
    status: str
    fingerprint: dict
    message: str


class VoiceSynthRequest(BaseModel):
    voice_model_slug: str = Field(min_length=2, max_length=64)
    text: str = Field(min_length=1, max_length=4000)
    used_by: str = Field(default="internal")
    output_path: str = Field(default="")
    language: str = Field(default="en")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


class VoiceSynthResponse(BaseModel):
    voice_model_slug: str
    output_path: str
    duration_seconds: float
    credits_charged: float
    creator_earned: float
    platform_earned: float


class VoiceUsageRead(BaseModel):
    id: int
    voice_model_id: int
    used_by: str
    text_length: int
    duration_seconds: float
    credits_charged: float
    creator_earned: float
    platform_earned: float
    created_at: datetime

    class Config:
        from_attributes = True


class SplitSummary(BaseModel):
    voice_model_slug: str
    owner_handle: str
    total_uses: int
    total_seconds: float
    total_credits: float
    creator_total: float
    platform_total: float
    activation_status: str
    activated_at: datetime | None


class VoiceFingerprintRead(BaseModel):
    voice_model_slug: str
    fingerprint: dict


# ─── HVS — Human Voice Signature ─────────────────────────────────────────────

class VoiceTypeProfile(BaseModel):
    register: str       # Bass / Baritone / Tenor / Contralto / Mezzo-Soprano / Soprano
    character: str      # Bright / Balanced / Dark
    texture: str        # Clear / Slightly breathy / Breathy
    energy: str         # High / Medium / Low
    expressiveness: str # Expressive / Controlled / Monotone


class VocalHealthProfile(BaseModel):
    health_score: float     # 0.0–1.0 composite
    pitch_stability: float
    breathiness: float      # 1.0 = clear
    effort_level: float
    hnr_approx: float
    dynamic_range: float
    vocal_fatigue: float    # 0.0 = fresh, 1.0 = fatigued
    rms_db: float


class DriftAlert(BaseModel):
    level: str    # LOW / MODERATE / HIGH
    score: float
    message: str


class HVSAnalyzeRequest(BaseModel):
    """Trigger HVS analysis on already-uploaded sample paths."""
    voice_model_slug: str = Field(min_length=2, max_length=64)
    regenerate_narrative: bool = Field(default=True)


class HVSReport(BaseModel):
    voice_model_slug: str
    owner_handle: str
    version: str
    samples_analyzed: int
    voice_type: VoiceTypeProfile | None
    vocal_health: VocalHealthProfile | None
    emotion_distribution: dict | None
    dominant_emotion: str | None
    neural_embedding_available: bool
    neural_embedding_dim: int
    drift: dict | None
    narrative: str | None
    generated_at: str
