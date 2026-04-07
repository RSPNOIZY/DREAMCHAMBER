/**
 * LUCY — n8n Bridge
 * 
 * Lucy thinks. n8n acts.
 * 
 * This bridge converts Lucy's opportunities into n8n-executable actions.
 * It creates webhook payloads, workflow triggers, and notification events
 * that n8n can pick up and execute.
 * 
 * Built for NOIZY.AI by Robert Stephen Plowman — The DreamChamber
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Opportunity, NightlyReport } from '../schemas/lucy-core';

// ─── CONFIG ──────────────────────────────────────────────

const N8N_QUEUE_DIR = '/Users/m2ultra/NOIZYLAB/lucy/n8n-queue';

// ─── N8N ACTION ──────────────────────────────────────────

export interface N8nAction {
  id: string;
  opportunity_id: string;
  
  // What to do
  action: string;
  executor: 'n8n' | 'human' | 'claude_code';
  priority: number;
  
  // n8n workflow targeting
  workflow_type: 'webhook' | 'cron' | 'manual';
  webhook_url?: string;
  
  // Payload for n8n
  payload: {
    action_type: string;
    actors: string[];
    brands: string[];
    details: Record<string, any>;
    revenue_impact?: { lower: number; upper: number; timeframe: string };
  };
  
  // Status
  status: 'queued' | 'sent' | 'acknowledged' | 'completed' | 'failed';
  
  // Governance
  requires_human_approval: boolean;
  compassion_cleared: boolean;
  
  created_at: string;
}

// ─── OPPORTUNITY FEED ────────────────────────────────────
// The feed that n8n reads from.

export interface OpportunityFeed {
  feed_id: string;
  generated_at: string;
  report_date: string;
  analysis_run_id: string;
  
  actions: N8nAction[];
  
  // Summary for n8n dashboard
  total_actions: number;
  n8n_actions: number;
  human_actions: number;
  claude_code_actions: number;
}

// ─── CONVERTER ───────────────────────────────────────────

/**
 * Convert Lucy's nightly report into an n8n opportunity feed.
 */
export function convertToN8nFeed(report: NightlyReport): OpportunityFeed {
  const actions: N8nAction[] = [];
  const now = new Date().toISOString();

  for (const opportunity of report.opportunities) {
    if (!opportunity.compassion_cleared) continue;

    for (const suggestion of opportunity.suggested_actions) {
      const action: N8nAction = {
        id: uuidv4(),
        opportunity_id: opportunity.id,
        action: suggestion.action,
        executor: suggestion.executor,
        priority: suggestion.priority,
        
        workflow_type: suggestion.executor === 'n8n' ? 'webhook' : 'manual',
        
        payload: {
          action_type: opportunity.insight_type,
          actors: opportunity.actors_involved,
          brands: opportunity.brands_involved,
          details: {
            title: opportunity.title,
            description: opportunity.description,
            confidence: opportunity.confidence,
            urgency: opportunity.urgency,
            reasoning: opportunity.reasoning_chain.map(r => r.thought).join(' → '),
          },
          revenue_impact: opportunity.estimated_revenue_impact
            ? {
                lower: opportunity.estimated_revenue_impact.lower,
                upper: opportunity.estimated_revenue_impact.upper,
                timeframe: opportunity.estimated_revenue_impact.timeframe,
              }
            : undefined,
        },
        
        status: 'queued',
        requires_human_approval: opportunity.requires_decision || suggestion.executor === 'human',
        compassion_cleared: opportunity.compassion_cleared,
        created_at: now,
      };

      actions.push(action);
    }
  }

  // Sort by priority
  actions.sort((a, b) => a.priority - b.priority);

  const feed: OpportunityFeed = {
    feed_id: uuidv4(),
    generated_at: now,
    report_date: report.date,
    analysis_run_id: report.analysis_run_id,
    actions,
    total_actions: actions.length,
    n8n_actions: actions.filter(a => a.executor === 'n8n').length,
    human_actions: actions.filter(a => a.executor === 'human').length,
    claude_code_actions: actions.filter(a => a.executor === 'claude_code').length,
  };

  // Write to n8n queue
  mkdirSync(N8N_QUEUE_DIR, { recursive: true });
  writeFileSync(
    join(N8N_QUEUE_DIR, `${report.date}-feed.json`),
    JSON.stringify(feed, null, 2),
  );

  return feed;
}

/**
 * Generate notification payloads for creators affected by opportunities.
 */
export function generateCreatorNotifications(report: NightlyReport): Array<{
  actor_id: string;
  notification_type: string;
  message: string;
  opportunity_id: string;
  requires_action: boolean;
}> {
  const notifications: Array<{
    actor_id: string;
    notification_type: string;
    message: string;
    opportunity_id: string;
    requires_action: boolean;
  }> = [];

  for (const opportunity of report.opportunities) {
    if (!opportunity.compassion_cleared) continue;

    for (const actorId of opportunity.actors_involved) {
      notifications.push({
        actor_id: actorId,
        notification_type: opportunity.insight_type,
        message: `Lucy discovered: ${opportunity.title}`,
        opportunity_id: opportunity.id,
        requires_action: opportunity.requires_decision,
      });
    }
  }

  return notifications;
}
