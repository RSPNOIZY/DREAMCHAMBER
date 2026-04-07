import { NoisyProofClient } from '../clients/noisy-proof';

export interface VoiceModel {
  id: string;
  name: string;
  creator_id: string;
  voice_identity_id: string;
  model_type: 'xtts' | 'bark' | 'custom';
  model_url: string;
  sample_audio_url?: string;
  status: 'active' | 'disabled' | 'archived';
}

export class VoiceModelRegistry {
  constructor(
    private db: D1Database,
    private proofClient: NoisyProofClient
  ) {}

  /**
   * Register a new voice model with provenance
   */
  async registerModel(params: {
    name: string;
    creatorId: string;
    modelType: VoiceModel['model_type'];
    modelUrl: string;
    voiceFingerprint: string;
    sampleAudioUrl?: string;
  }): Promise<VoiceModel> {
    // First, register voice identity in Noisy Proof
    const voiceIdentity = await this.proofClient.registerVoiceIdentity({
      creatorId: params.creatorId,
      voiceFingerprint: params.voiceFingerprint,
      verificationMethod: 'ai_verified',
      metadata: {
        model_type: params.modelType,
        registered_from: 'noisy_vox'
      }
    });

    const modelId = crypto.randomUUID();
    const model: VoiceModel = {
      id: modelId,
      name: params.name,
      creator_id: params.creatorId,
      voice_identity_id: voiceIdentity.id,
      model_type: params.modelType,
      model_url: params.modelUrl,
      sample_audio_url: params.sampleAudioUrl,
      status: 'active'
    };

    await this.db
      .prepare(`
        INSERT INTO voice_models 
        (id, name, creator_id, voice_identity_id, model_type, model_url, sample_audio_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        model.id,
        model.name,
        model.creator_id,
        model.voice_identity_id,
        model.model_type,
        model.model_url,
        model.sample_audio_url || null,
        model.status
      )
      .run();

    return model;
  }

  /**
   * Get model with consent status for requester
   */
  async getModelWithConsent(
    modelId: string,
    requesterId: string
  ): Promise<{
    model: VoiceModel;
    hasConsent: boolean;
    consentDetails?: any;
  }> {
    const model = await this.db
      .prepare('SELECT * FROM voice_models WHERE id = ?')
      .bind(modelId)
      .first<VoiceModel>();

    if (!model) {
      throw new Error('Voice model not found');
    }

    // Check consent through Noisy Proof
    const consentCheck = await this.proofClient.checkConsent({
      creatorId: model.creator_id,
      requesterId,
      voiceIdentityId: model.voice_identity_id
    });

    return {
      model,
      hasConsent: consentCheck.authorized,
      consentDetails: consentCheck
    };
  }

  /**
   * List available models for requester
   */
  async listAvailableModels(requesterId: string): Promise<Array<{
    model: VoiceModel;
    hasConsent: boolean;
  }>> {
    const models = await this.db
      .prepare('SELECT * FROM voice_models WHERE status = ?')
      .bind('active')
      .all<VoiceModel>();

    // Check consent for each model
    const modelsWithConsent = await Promise.all(
      models.results.map(async (model) => {
        const consentCheck = await this.proofClient.checkConsent({
          creatorId: model.creator_id,
          requesterId,
          voiceIdentityId: model.voice_identity_id
        });

        return {
          model,
          hasConsent: consentCheck.authorized
        };
      })
    );

    return modelsWithConsent;
  }

  /**
   * Grant public access to a model
   */
  async grantPublicAccess(modelId: string, creatorId: string): Promise<void> {
    // Verify ownership
    const model = await this.db
      .prepare('SELECT * FROM voice_models WHERE id = ? AND creator_id = ?')
      .bind(modelId, creatorId)
      .first<VoiceModel>();

    if (!model) {
      throw new Error('Model not found or unauthorized');
    }

    await this.db
      .prepare(`
        INSERT INTO model_access 
        (id, voice_model_id, granted_to_id, access_type, granted_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `)
      .bind(
        crypto.randomUUID(),
        modelId,
        '*', // Public access
        'public'
      )
      .run();
  }

  /**
   * Log synthesis request
   */
  async logSynthesisRequest(params: {
    voiceModelId: string;
    requesterId: string;
    textHash: string;
    fingerprintId?: string;
    consentRecordId?: string;
    status: 'pending' | 'authorized' | 'synthesized' | 'rejected';
  }): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO synthesis_requests 
        (id, voice_model_id, requester_id, text_hash, fingerprint_id, consent_record_id, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(
        crypto.randomUUID(),
        params.voiceModelId,
        params.requesterId,
        params.textHash,
        params.fingerprintId || null,
        params.consentRecordId || null,
        params.status
      )
      .run();
  }
}
