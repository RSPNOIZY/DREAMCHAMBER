import { NoisyProofClient } from './clients/noisy-proof';

export class ConsentIntegration {
  private proofClient: NoisyProofClient;

  constructor(proofApiUrl: string) {
    this.proofClient = new NoisyProofClient(proofApiUrl);
  }

  /**
   * Check consent before voice synthesis
   */
  async checkVoiceCloneConsent(params: {
    voiceModelId: string;
    creatorId: string;
    requesterId: string;
  }): Promise<{
    authorized: boolean;
    consentRecordId?: string;
    reason?: string;
  }> {
    // Map voice model to voice identity in Noisy Proof
    const voiceIdentityId = await this.mapVoiceModelToIdentity(params.voiceModelId);
    
    if (!voiceIdentityId) {
      return {
        authorized: false,
        reason: 'Voice model not registered in provenance system'
      };
    }

    // Check consent through Noisy Proof
    const consentCheck = await this.proofClient.checkConsent({
      creatorId: params.creatorId,
      requesterId: params.requesterId,
      voiceIdentityId
    });

    return consentCheck;
  }

  /**
   * Register synthesized audio with provenance
   */
  async registerSynthesizedAudio(params: {
    audioBuffer: ArrayBuffer;
    voiceModelId: string;
    requesterId: string;
    synthesisParams: any;
  }): Promise<{
    fingerprintId: string;
    watermarkId: string;
    manifestId: string;
  }> {
    // Generate fingerprint from audio
    const fingerprint = await this.generateFingerprint(params.audioBuffer);
    const fileHash = await this.hashAudioBuffer(params.audioBuffer);

    // Register with full provenance
    const registration = await this.proofClient.registerAudio({
      fileHash,
      fingerprint,
      creatorId: params.requesterId,
      title: `Synthesized from model ${params.voiceModelId}`,
      metadata: {
        source: 'noisy_vox',
        voice_model: params.voiceModelId,
        synthesis_params: params.synthesisParams
      }
    });

    return registration;
  }

  /**
   * Inject watermark into synthesized audio
   */
  async watermarkAudio(params: {
    audioBuffer: ArrayBuffer;
    fingerprintId: string;
    metadata: any;
  }): Promise<ArrayBuffer> {
    // This would integrate with actual audio processing
    // For now, return the original buffer
    // In production, use Web Audio API or server-side processing
    return params.audioBuffer;
  }

  private async mapVoiceModelToIdentity(voiceModelId: string): Promise<string | null> {
    // Query mapping between NoisyVox models and Proof identities
    // This would be stored in a database
    const mapping: Record<string, string> = {
      'model_gabriel': 'voice_identity_gabriel',
      'model_sarah': 'voice_identity_sarah'
      // etc
    };
    
    return mapping[voiceModelId] || null;
  }

  private async generateFingerprint(audioBuffer: ArrayBuffer): Promise<string> {
    // Integrate with Chromaprint or similar
    // For now, generate a hash-based fingerprint
    const hashBuffer = await crypto.subtle.digest('SHA-256', audioBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async hashAudioBuffer(audioBuffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', audioBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Client for Noisy Proof API
