// mc96/types.ts

export type AgentId = 
  | 'SHIRL'       // GOD(.10) — emotional anchor
  | 'POPS'        // GOD(.10) — wisdom, longview
  | 'ENGR_KEITH'  // GOD(.10) — engineering, systems
  | 'DREAM'       // GABRIEL(.20) — vision, futures
  | 'GABRIEL'     // GABRIEL(.20) — warrior executor
  | 'RSP_001'     // DaFixer(.40) — north star, you
  | 'BROADCAST';

export type IntentClass =
  | 'PERMISSION_REQUEST'    // needs POPS + ENGR_KEITH to approve
  | 'VISION_QUERY'          // needs DREAM
  | 'EXECUTION_TASK'        // needs GABRIEL
  | 'WISDOM_QUERY'          // needs POPS
  | 'ENGINEERING_QUERY'     // needs ENGR_KEITH
  | 'EMOTIONAL_SUPPORT'     // needs SHIRL
  | 'MEMORY_WRITE'          // write to shared D1
  | 'MEMORY_READ'           // read from shared D1
  | 'STATUS_BROADCAST'      // gossip — all agents update state
  | 'CREATIVE_SESSION';     // needs DREAM + GABRIEL in parallel

export type MessagePriority = 1 | 2 | 3 | 5 | 7 | 9;
// 1=CRITICAL | 2=URGENT | 3=HIGH | 5=NORMAL | 7=LOW | 9=BACKGROUND

export interface MC96Message {
  id: string;               // nanoid
  from: AgentId;
  to: AgentId | 'BROADCAST';
  intent: IntentClass;
  priority: MessagePriority;
  payload: {
    text: string;           // human-readable request
    context?: object;       // structured data
    requires_permission?: boolean;
    parallel_agents?: AgentId[];  // execute these simultaneously
  };
  timestamp: number;
}

export interface AgentResponse {
  agent_id: AgentId;
  message_id: string;
  response: string;
  confidence: number;       // 0.0–1.0
  actions_taken?: string[];
  next_routes?: AgentId[];  // suggest further routing
  learning?: string;        // what this agent learned from this exchange
}
