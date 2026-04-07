# Biometric Governance

## Summary

Biometric and affective-computing features create major privacy and compliance obligations. The system must be designed so raw physiological input stays local by default.

## Baseline Position

- Raw EMG, nerve, breath, gaze, and similar signals remain on-device.
- Only derived intent vectors and signed audit metadata leave the device.
- Consent, retention, deletion, and export rights must be explicit.

## Design Boundaries

- Do not promise emotion inference without governance.
- Treat "proof of humanity" claims carefully.
- Separate performance control from identity classification.

## Product Implications

- Local inference module
- Clear consent prompts
- Session-level privacy logs
- Revocation flow for archived biometric artifacts

## Next Actions

- Define the Intent Vector boundary.
- Add a privacy appendix for Nerve-to-Note.

