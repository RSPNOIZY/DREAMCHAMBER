---
name: golden-rules-governance
description: "8 Golden Rules for Guild of Artists democratic governance — Assembly, Council, voting, amendments, and organizational-failure-proof protections"
---

# GOLDEN RULES — GUILD OF ARTISTS GOVERNANCE

**Skill ID**: `golden-rules-governance`
**Author**: Claude Code on behalf of RSP_001
**Version**: 1.0
**Last Updated**: 2026-03-25
**Lines**: 312

---

## MISSION

These 8 immutable governance rules define how creators—not management—govern NOIZY through democratic structures.
Maps directly to **Golden Principle 4**: *Creators govern. The platform serves.*

---

## RULE G1: THE GUILD ASSEMBLY IS THE SUPREME GOVERNING BODY

The Guild Assembly is the final authority on all NOIZY policy matters.

### Structure
- **Membership**: Every enrolled creator is automatically a member. No application, no gatekeeping.
- **Voting Power**: One creator, one vote. Equal voice regardless of royalty tier, tenure, or follower count.
- **Meeting Cadence**: Quarterly virtual assembly (90-day intervals). Emergency sessions can be called by:
  - Creator Council (5 signatures)
  - 10% of enrolled creators
  - RSP_001

### Quorum & Passage
- **Standard votes** (policy, budget, appointments): 20% quorum, simple majority (50% + 1)
- **Constitutional amendments**: 50% quorum, 75% supermajority
- **Golden Principle amendments**: Effectively impossible (90% supermajority + Technical Committee veto)

### Decisions Are Binding
- Management must implement Assembly votes within 30 days or publish a written objection
- If objection is filed, dispute goes to arbitration (Creator Council + external mediator)
- No Assembly decision can be overridden by CEO, board, or any executive authority

**D1 Table**: `guild_assembly_votes`
```sql
CREATE TABLE guild_assembly_votes (
    vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER UNIQUE NOT NULL,
    vote_type TEXT NOT NULL, -- 'standard' | 'constitutional' | 'golden_principle'
    quorum_required INTEGER NOT NULL,
    supermajority_required INTEGER NOT NULL,
    yes_count INTEGER DEFAULT 0,
    no_count INTEGER DEFAULT 0,
    abstain_count INTEGER DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open', -- 'open' | 'closed' | 'finalized'
    created_at TEXT NOT NULL,
    closed_at TEXT,
    updated_at TEXT NOT NULL
);
```

---

## RULE G2: THE CREATOR COUNCIL PROVIDES EXECUTIVE OVERSIGHT

The Creator Council is the elected steward between Assembly sessions.

### Composition (9 Members, 2-Year Terms)
- **3 Music creators** (any genre, democratic election)
- **2 Voice actors** (character, narrative, union representation)
- **2 Podcasters** (editorial independence, audience)
- **1 Audiobook narrator** (preservation, intimacy)
- **1 At-large** (emerging voices, wildcards)

### Elections
- **Staggered**: 1st year, elect 4–5 members. 2nd year, elect remaining 4–5. No lame-duck period.
- **Voting**: All creators vote. Single-transferable vote (instant runoff) for fairness.
- **Nomination**: Any creator can nominate. Self-nomination allowed. 2-week nomination window.
- **Campaign**: Candidates submit 500-word statement. Published to all members.

### Powers & Responsibilities
- Meets monthly (2-hour meetings, published minutes within 48 hours)
- Reviews budget, hires/fires CEO, approves new union tiers
- Can call emergency Assembly votes (with 24-hour notice)
- Cannot override Assembly decisions—only implement them
- Has standing to dispute technical changes (escalate to Technical Committee)

### Removal
- Any member can be recalled by 50% vote of Assembly (initiated by 5% of creators)
- If 3+ members step down, special election held within 60 days

**D1 Tables**:
```sql
CREATE TABLE creator_council_members (
    member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL, -- 'music' | 'voice_actor' | 'podcaster' | 'audiobook' | 'at_large'
    term_start DATE NOT NULL,
    term_end DATE NOT NULL,
    elected_timestamp TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active' | 'recalled' | 'resigned'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE council_elections (
    election_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tier TEXT NOT NULL,
    nomination_open DATE NOT NULL,
    nomination_close DATE NOT NULL,
    voting_open DATE NOT NULL,
    voting_close DATE NOT NULL,
    elected_creator_id TEXT,
    total_votes INTEGER DEFAULT 0,
    election_status TEXT DEFAULT 'pending', -- 'pending' | 'open' | 'closed' | 'finalized'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## RULE G3: THE TECHNICAL COMMITTEE GUARDS IMPLEMENTATION

The Technical Committee prevents technical changes from undermining consent architecture.

### Composition (5 Members)
- **2 Elected creators** (with technical literacy—can be learned on the job)
- **2 Appointed engineers** (hired by CEO, confirmed by Creator Council, ~2-year terms)
- **1 RSP_001 appointee** (usually an architect trusted by RSP_001)

### Veto Authority
The Technical Committee has **VETO power** (blocking, not removal) over:
- Any changes to **Consent Kernel** (HVS validation, Never Clauses)
- Any changes to **Covenant validator** (proof system, ledger schema)
- Any changes to **Kill Switch** implementation or access controls
- Any changes to **C2PA watermarking** or content credential system
- Any changes to **governance ledger** (voting, proposals, minutes)

### Review Process
1. **Notification**: Engineering team files change request with Technical Committee (72 hours before deploy)
2. **Review**: Committee meets within 48 hours, asks questions, reviews code
3. **Decision**: Approve, request changes, or VETO (unanimous required for veto)
4. **If vetoed**: Change cannot deploy until veto is withdrawn OR Assembly votes to override (2/3 supermajority)

### Meetings
- Monthly required meetings
- Emergency review for critical/security changes (2-hour turnaround)
- Minutes published to Creator Council

**D1 Table**:
```sql
CREATE TABLE technical_committee_reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_id TEXT UNIQUE NOT NULL,
    subsystem TEXT NOT NULL, -- 'consent_kernel' | 'covenant' | 'kill_switch' | 'c2pa' | 'governance_ledger'
    change_description TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    review_deadline TEXT NOT NULL,
    reviewed_by TEXT, -- committee member who led review
    status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'changes_requested' | 'vetoed'
    veto_reason TEXT,
    veto_withdrawn_by TEXT,
    veto_withdrawn_at TEXT,
    final_decision_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## RULE G4: VOTING MECHANISMS ARE TRANSPARENT AND VERIFIABLE

All Assembly and Council votes are recorded immutably and auditable.

### Vote Recording
- **Ledger**: Appended to `governance_ledger` (same append-only architecture as consent ledger)
- **Immutability**: No vote record can be modified or deleted
- **Completeness**: Every vote cast recorded with:
  - Voter ID (hashed for privacy)
  - Proposal ID
  - Choice (yes/no/abstain)
  - Timestamp
  - Commitment (Pedersen hash for later verification)

### Anonymous Voting with Verifiable Tally
- **Commitment scheme**: Voter hashes choice before submission
- **Reveal phase**: After vote closes, voters reveal their hash preimage
- **Tally verification**: Anyone can recompute tally from ledger
- **Privacy**: No one knows individual votes until commitment is revealed (voters can choose not to reveal = anonymity preserved)

### Results Publication
- **Timeline**: Within 24 hours of vote close
- **Content**: Proposal summary, yes/no/abstain counts, percentage, quorum met, result (pass/fail)
- **Ledger proof**: MD5 hash of ledger segment published (allows external audit)

### Dispute Resolution
- Any creator can request independent audit of vote (costs ~$500, paid by requestor)
- Auditor has read-only access to governance_ledger
- If discrepancy found: vote is revoked, revote called within 14 days
- Auditor report published to all members

**D1 Tables**:
```sql
CREATE TABLE governance_votes_cast (
    cast_id INTEGER PRIMARY KEY AUTOINCREMENT,
    vote_id INTEGER NOT NULL,
    voter_id_hash TEXT NOT NULL,
    choice TEXT NOT NULL, -- 'yes' | 'no' | 'abstain'
    commitment_hash TEXT NOT NULL,
    commitment_revealed INTEGER DEFAULT 0, -- 0 | 1
    revealed_preimage TEXT,
    cast_timestamp TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE governance_audit_requests (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    vote_id INTEGER UNIQUE NOT NULL,
    requested_by TEXT NOT NULL,
    requested_at TEXT NOT NULL,
    auditor_name TEXT,
    auditor_firm TEXT,
    audit_status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'complete'
    findings TEXT,
    discrepancies_found INTEGER DEFAULT 0,
    report_published INTEGER DEFAULT 0,
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## RULE G5: CONSTITUTIONAL AMENDMENTS REQUIRE SUPERMAJORITY

The NOIZY Constitution can evolve, but only with overwhelming creator consensus.

### Amendment Thresholds
- **Policy amendments** (non-Golden Principle): 75% supermajority, 50% quorum
- **Golden Principle amendments**: 90% supermajority, 50% quorum (near-impossible by design)
- **Never Clause amendments**: Equivalent to Golden Principle (90% supermajority)

### Amendment Process
1. **Proposal Phase** (14 days):
   - Creator or Council files amendment proposal (written text, rationale)
   - Published to all members
   - Comments solicited

2. **Review Phase** (30 days):
   - Creator Council discusses with community
   - Any counter-proposals filed
   - Revised amendment language published

3. **Public Comment** (180 days):
   - Amendment published in full
   - Town halls held (virtual)
   - Concerns documented

4. **Voting** (21-day window):
   - Amendment text finalized
   - Vote held
   - Results published

5. **Implementation** (if passed):
   - Amendment becomes effective 30 days after passage
   - All systems updated
   - Ledger reflects effective date

### Immutable Safeguards
- **No amendment can weaken consent protections**. This rule itself is immutable—cannot be amended.
- **Never Clauses are constitutional**. Removal requires 90% supermajority + Technical Committee approval.
- **Kill Switch is permanent**. Cannot be removed or circumscribed.

**D1 Table**:
```sql
CREATE TABLE constitutional_amendments (
    amendment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_number TEXT UNIQUE NOT NULL, -- 'CONST-2026-001'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    proposed_by TEXT NOT NULL,
    proposed_at TEXT NOT NULL,
    amendment_type TEXT NOT NULL, -- 'policy' | 'golden_principle' | 'never_clause'
    supermajority_required REAL NOT NULL, -- 0.75 | 0.90
    amendment_status TEXT DEFAULT 'proposal', -- 'proposal' | 'review' | 'public_comment' | 'voting' | 'passed' | 'failed' | 'enacted'
    vote_id INTEGER,
    enacted_date DATE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## RULE G6: CREATOR REMOVAL OF MANAGEMENT

The Guild Assembly retains ultimate accountability power.

### Removal Authority
- Guild Assembly can vote to remove **ANY** management officer at **ANY** time
- Includes: CEO, CFO, board members, division heads
- Exception: RSP_001 (special status as founder)

### RSP_001 Removal (Emergency Succession)
- Requires **90% supermajority** of Assembly + **unanimous vote** of Creator Council
- 60-day notice period (allows RSP_001 to voluntarily step down)
- Grounds: Breach of Golden Principles, demonstrable conflict of interest, incapacity
- Cannot be done lightly—but can be done if absolutely necessary

### Standard Officer Removal
- Requires **66% supermajority** of Assembly (lower bar because not founder)
- 30-day notice period
- No cause required (Assembly is supreme)
- Officer can request public hearing (24 hours, streamed live)

### Succession
- Removal vote must nominate replacement within 72 hours OR Acting CEO takes over temporarily
- New officer confirmed by Creator Council within 14 days

**D1 Table**:
```sql
CREATE TABLE management_removal_votes (
    removal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_officer TEXT NOT NULL,
    target_role TEXT NOT NULL, -- 'ceo' | 'cfo' | 'board_member' | etc.
    removal_reason TEXT,
    proposed_by TEXT NOT NULL,
    proposed_at TEXT NOT NULL,
    notice_period_days INTEGER NOT NULL,
    supermajority_required REAL NOT NULL, -- 0.66 | 0.90
    vote_id INTEGER,
    removal_status TEXT DEFAULT 'notice_sent', -- 'notice_sent' | 'hearing' | 'voted' | 'executed' | 'withdrawn'
    succession_candidate TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## RULE G7: FINANCIAL TRANSPARENCY IS MANDATORY

Creators cannot trust a system they cannot see.

### Quarterly Reporting (Within 30 Days of Quarter Close)
- **Revenue**: Total platform revenue by source (synthesis requests, licensing, partnerships, donations)
- **Costs**: Hosting, processing, engineering, legal, admin—line-item detail
- **Royalty distributions**: Total paid to creators, by tier
- **Reserve fund**: Available cash, reserves, debt
- **Metric trends**: Month-over-month growth, new creators, synthesis volume

### Annual Independent Audit
- Big-4 accounting firm or creator-selected auditor
- Audit covers: royalty calculations, expense allocation, fund reserves
- Results published to Assembly

### Individual Creator Audits
- Any creator can request a detailed audit of their own royalty calculations
- Cost borne by platform (not creator)
- 30-day turnaround
- Results confidential to creator (but methodology transparent)

### The 75/25 Split Is Constitutional
- Creators receive minimum 75% of platform revenue attributed to their work
- Management receives maximum 25%
- **Cannot be changed below 75%** without Golden Principle amendment (90% supermajority)
- Royalty disputes resolved by independent auditor (creator can appeal to Assembly)

**D1 Tables**:
```sql
CREATE TABLE financial_reports_quarterly (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    quarter TEXT UNIQUE NOT NULL, -- '2026-Q1'
    report_date DATE NOT NULL,
    total_revenue REAL NOT NULL,
    total_costs REAL NOT NULL,
    creator_royalties_paid REAL NOT NULL,
    management_take REAL NOT NULL,
    reserve_fund REAL NOT NULL,
    cash_available REAL NOT NULL,
    report_file_url TEXT,
    auditor_certified INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE royalty_audits (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id TEXT NOT NULL,
    audit_quarter TEXT NOT NULL,
    audit_type TEXT NOT NULL, -- 'individual' | 'full_platform'
    auditor_name TEXT,
    auditor_firm TEXT,
    synthesis_count INTEGER,
    calculated_royalties REAL,
    discrepancies TEXT,
    audit_status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'complete'
    findings_published INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## RULE G8: SUCCESSION AND CONTINUITY

NOIZY outlives any single person or organizational structure.

### If RSP_001 Is Incapacitated
- Creator Council immediately assumes executive authority (collective governance)
- Council elects Chair for coordination (acting CEO role)
- Within 14 days, propose permanent succession (RSP_001 or Council-nominated successor)
- Assembly votes on succession within 30 days

### If Creator Council Cannot Function (3+ vacancies, deadlocked)
- Guild Assembly calls emergency session
- Elects emergency leadership team (5 members, 90-day terms)
- Emergency team stabilizes operations
- New elections held for full Council within 60 days

### If NOIZY Dissolves or Is Acquired
- **Data custody**: All creator data, Voice DNA, consent records transfer to creator custody (or creator-selected trustee)
- **Ledger**: Governance ledger, consent ledger archived in tamper-proof format (OAIS/PREMIS)
- **Intellectual property**: All creator voices, work, consent records remain creator property
- **Covenant**: Kill Switch transferred to creator-controlled escrow (no acquiring entity can override)

### Governance Structures Survive Organizational Changes
- The Guild Assembly is chartered independently (registered legal entity)
- Council elections continue regardless of NOIZY corporate status
- Constitution binding on any successor organization
- If platform is rebuilt: creators bring their governance structure with them

**D1 Tables**:
```sql
CREATE TABLE succession_plans (
    plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_type TEXT NOT NULL, -- 'rsp_incapacitation' | 'council_failure' | 'dissolution'
    trigger_event TEXT NOT NULL,
    trigger_date DATE,
    interim_leadership TEXT, -- comma-separated creator IDs
    interim_duration_days INTEGER,
    permanent_successor TEXT,
    succession_vote_id INTEGER,
    plan_status TEXT DEFAULT 'pending', -- 'pending' | 'activated' | 'executed'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE organizational_dissolution (
    dissolution_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger_date DATE,
    dissolution_reason TEXT,
    creator_data_custodian TEXT, -- creator or organization name
    ledger_archive_location TEXT,
    kill_switch_escrow TEXT,
    governance_structure_status TEXT DEFAULT 'preserved',
    archive_verified INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## PROCEDURAL DETAILS

### How to Call a Vote

1. File proposal with Guild Secretary (email + form)
2. Proposal circulated to Creator Council (24-hour review)
3. If approved: published to all creators with 14-day notice
4. Vote window: 21 days
5. Results published: 24 hours after close

### How to Nominate Council Candidates

1. Self-nominate or nominate another creator
2. Submission form (include 500-word statement)
3. Validation: nominee must confirm acceptance
4. Published to all creators
5. Voting window: 21 days (single-transferable vote)

### How to Dispute a Vote

1. Request independent audit (within 30 days of vote close)
2. Auditor assigned, conducts ledger review
3. Report published (confidential if creator prefers)
4. If discrepancy found: vote invalidated, revote called
5. Dispute cost: $500 (paid by platform if audit confirms error)

---

## CROSS-REFERENCES

- **Golden Principles**: Principle 4 (governance) is foundational
- **Golden Rules Agents**: Agents execute governance decisions
- **Universal Protector Strategy**: Legal framework supporting governance
- **Consent Kernel** (heaven-api.md): Technical implementation of creator authority
- **DAZEFLOW** (Lucy MCP): Session tracking that includes governance participation

---

## SUMMARY: THE STRUCTURE AT A GLANCE

```
┌─────────────────────────────────────────────────────┐
│  GUILD ASSEMBLY (All Creators)                      │
│  - Supreme decision authority                       │
│  - Quarterly meetings, emergency sessions           │
│  - Votes on all major policy, elections, removal    │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴──────────────┐
         │                          │
    ┌────▼────────┐         ┌──────▼──────────┐
    │Creator      │         │Technical        │
    │Council      │         │Committee        │
    │(9 elected)  │         │(5 mixed)        │
    │             │         │                 │
    │- Oversight  │         │- VETO power     │
    │- Budget     │         │- Consent guard  │
    │- Monthly    │         │- Monthly        │
    └─────────────┘         └─────────────────┘
```

**Creators govern. The platform serves. That order never reverses.**

---

*End of Skill: `golden-rules-governance` (312 lines)*
