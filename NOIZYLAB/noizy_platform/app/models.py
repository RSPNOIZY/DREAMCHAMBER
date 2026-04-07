import datetime as dt

from sqlalchemy import Boolean, CheckConstraint, DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class AVAProfile(Base):
    __tablename__ = "ava_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(128))
    voice_provider: Mapped[str] = mapped_column(String(32), default="piper")
    stt_provider: Mapped[str] = mapped_column(String(32), default="whisper")
    tone_preset: Mapped[str] = mapped_column(String(64), default="neutral")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.now)
    updated_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), default=dt.datetime.now, onupdate=dt.datetime.now
    )
    onboarding_progress: Mapped[list["ActorJourneyProgress"]] = relationship(
        back_populates="ava", cascade="all, delete-orphan"
    )
    audio_assets: Mapped[list["ActorAudioAsset"]] = relationship(
        back_populates="ava", cascade="all, delete-orphan"
    )
    use_profile: Mapped["AVAUseProfile | None"] = relationship(
        back_populates="ava", uselist=False, cascade="all, delete-orphan"
    )


class Composer(Base):
    __tablename__ = "composers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    handle: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(32), default="composer")
    specialties: Mapped[str] = mapped_column(String(256), default="")
    joined_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.now)

    teacher_assignment: Mapped["TeacherAssignment | None"] = relationship(
        back_populates="composer", uselist=False, cascade="all, delete-orphan"
    )


class TeacherAssignment(Base):
    __tablename__ = "teacher_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    composer_id: Mapped[int] = mapped_column(ForeignKey("composers.id", ondelete="CASCADE"), unique=True)
    track: Mapped[str] = mapped_column(String(64), default="noizykidz_music_ai")
    promoted_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.now)

    composer: Mapped[Composer] = relationship(back_populates="teacher_assignment")


class MediaIngest(Base):
    __tablename__ = "media_ingest"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    media_type: Mapped[str] = mapped_column(String(32))
    source_uri: Mapped[str] = mapped_column(String(512))
    created_by: Mapped[str] = mapped_column(String(128), default="system")
    status: Mapped[str] = mapped_column(String(32), default="queued")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.now)


class PipelineJob(Base):
    __tablename__ = "pipeline_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_type: Mapped[str] = mapped_column(String(32))
    provider: Mapped[str] = mapped_column(String(32))
    input_ref: Mapped[str] = mapped_column(String(512))
    output_ref: Mapped[str] = mapped_column(String(512), default="")
    status: Mapped[str] = mapped_column(String(32), default="queued")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.now)


class ActorJourneyProgress(Base):
    __tablename__ = "actor_journey_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ava_id: Mapped[int] = mapped_column(ForeignKey("ava_profiles.id", ondelete="CASCADE"), index=True)
    step_key: Mapped[str] = mapped_column(String(64), index=True)
    status: Mapped[str] = mapped_column(String(24), default="not_started")
    notes: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), default=dt.datetime.now, onupdate=dt.datetime.now
    )

    ava: Mapped[AVAProfile] = relationship(back_populates="onboarding_progress")


class ActorAudioAsset(Base):
    __tablename__ = "actor_audio_assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ava_id: Mapped[int] = mapped_column(ForeignKey("ava_profiles.id", ondelete="CASCADE"), index=True)
    original_filename: Mapped[str] = mapped_column(String(255))
    stored_path: Mapped[str] = mapped_column(String(512))
    normalized_wav_path: Mapped[str] = mapped_column(String(512), default="")
    archival_wav_path: Mapped[str] = mapped_column(String(512), default="")
    immersive_wav_path: Mapped[str] = mapped_column(String(512), default="")
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    sample_rate: Mapped[int] = mapped_column(Integer, default=0)
    channels: Mapped[int] = mapped_column(Integer, default=0)
    quality_profile: Mapped[str] = mapped_column(String(64), default="future_ready_v1")
    quality_report_json: Mapped[str] = mapped_column(Text, default="{}")
    transcript_excerpt: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="processed")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.now)

    ava: Mapped[AVAProfile] = relationship(back_populates="audio_assets")


class AVAUseProfile(Base):
    __tablename__ = "ava_use_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ava_id: Mapped[int] = mapped_column(ForeignKey("ava_profiles.id", ondelete="CASCADE"), unique=True, index=True)
    profile_json: Mapped[str] = mapped_column(Text, default="{}")
    updated_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), default=dt.datetime.now, onupdate=dt.datetime.now
    )

    ava: Mapped[AVAProfile] = relationship(back_populates="use_profile")


# ─── NOIZYVOX — Voice Ownership & 75/25 Split Engine ─────────────────────────

class VoiceModel(Base):
    """A creator-owned voice model. Locked to 75/25 split after activation."""
    __tablename__ = "voice_models"
    __table_args__ = (
        # Enforce that creator + platform always sum to 1.0 — immutable protocol guarantee
        CheckConstraint("round(creator_share + platform_share, 6) = 1.0", name="ck_voice_model_split_sum"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    owner_handle: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    # model artifacts
    xtts_checkpoint_path: Mapped[str] = mapped_column(String(512), default="")
    speaker_embedding_path: Mapped[str] = mapped_column(String(512), default="")
    gpt_cond_latent_path: Mapped[str] = mapped_column(String(512), default="")
    # librosa fingerprint (JSON)
    voice_fingerprint_json: Mapped[str] = mapped_column(Text, default="{}")
    # lifecycle
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending|training|active|suspended
    activated_at: Mapped[dt.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.now)
    # 75/25 split: creator_share always 0.75, platform_share always 0.25 — cannot be changed
    creator_share: Mapped[float] = mapped_column(Float, default=0.75, nullable=False)
    platform_share: Mapped[float] = mapped_column(Float, default=0.25, nullable=False)

    usage_records: Mapped[list["VoiceUsage"]] = relationship(
        back_populates="voice_model", cascade="all, delete-orphan"
    )


class VoiceUsage(Base):
    """Every synthesis call logged for split calculation."""
    __tablename__ = "voice_usage"
    __table_args__ = (
        Index("ix_voice_usage_model_created", "voice_model_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    voice_model_id: Mapped[int] = mapped_column(ForeignKey("voice_models.id", ondelete="CASCADE"), index=True, nullable=False)
    used_by: Mapped[str] = mapped_column(String(64), default="anonymous", nullable=False)
    text_length: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    output_path: Mapped[str] = mapped_column(String(512), default="")
    # billing (in NOIZY credits — 1 credit = 1 second of generated audio)
    credits_charged: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    creator_earned: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # credits * 0.75
    platform_earned: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # credits * 0.25
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.now)

    voice_model: Mapped[VoiceModel] = relationship(back_populates="usage_records")


class SplitRecord(Base):
    """Aggregated monthly split summary per voice model."""
    __tablename__ = "split_records"
    __table_args__ = (
        # One record per voice model per calendar month — prevents duplicate split accumulation
        UniqueConstraint("voice_model_id", "period_year", "period_month", name="uq_split_record_period"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    voice_model_id: Mapped[int] = mapped_column(ForeignKey("voice_models.id", ondelete="CASCADE"), index=True, nullable=False)
    period_year: Mapped[int] = mapped_column(Integer, nullable=False)
    period_month: Mapped[int] = mapped_column(Integer, nullable=False)
    total_uses: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_seconds: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_credits: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    creator_total: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    platform_total: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    paid_out: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.now)
