export class NoisyProofClient {
  constructor(
    private apiUrl: string,
    private apiKey?: string,
  ) {}

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) h["Authorization"] = `Bearer ${this.apiKey}`;
    return h;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      ...init,
      headers: { ...this.headers, ...init?.headers },
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`NoisyProof ${path} returned ${response.status}: ${body}`);
    }
    return response.json() as Promise<T>;
  }

  async checkConsent(params: {
    creatorId: string;
    requesterId: string;
    voiceIdentityId: string;
  }): Promise<{
    authorized: boolean;
    consentRecordId?: string;
    reason?: string;
  }> {
    return this.request("/consent/check", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async registerAudio(params: {
    fileHash: string;
    fingerprint: string;
    creatorId: string;
    title: string;
    metadata?: any;
  }): Promise<{
    fingerprintId: string;
    watermarkId: string;
    manifestId: string;
  }> {
    return this.request("/audio/register", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async registerVoiceIdentity(params: {
    creatorId: string;
    voiceFingerprint: string;
    verificationMethod: "biometric" | "manual" | "ai_verified";
    metadata?: any;
  }): Promise<{ id: string }> {
    return this.request("/voice-identity/register", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async getProvenance(fingerprintId: string): Promise<{
    valid: boolean;
    origin: "noisy" | "external" | "unknown";
    consent?: any;
    watermark?: any;
    c2pa?: any;
  }> {
    return this.request(`/provenance/${fingerprintId}`);
  }

  async grantConsent(params: {
    creatorId: string;
    consentedEntityId: string;
    consentType: "voice_clone" | "sample_use" | "derivative_work";
    expiresAt?: string;
    termsVersion: string;
  }): Promise<any> {
    return this.request("/consent/grant", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}
