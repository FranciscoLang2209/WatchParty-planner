export type Status =
  | 'todo'
  | 'backlog'
  | 'in_progress'
  | 'review'
  | 'done'
  | 'blocked';
export type Scope = 'must' | 'should' | 'could' | 'wont';
export type Feature = {
  id: string;
  title: string;
  description: string;
  status: Status;
  estimate: number | null;
  starts: string | null;
  ends: string | null;
  depends_on: string[];
  prototype: string[];
  ticket_refs: string[];
  moscow?: Scope;
  evidence: string;
  acceptance: string[];
  owner_id: string | null;
  tracker_status?: string;
  kind?: string;
};
export type Epic = {
  id: string;
  title: string;
  description: string;
  sprint: number;
  moscow: Scope;
  features: Feature[];
  fixes?: boolean;
};
export type Person = {
  id: string;
  name: string;
  role: string;
  takes_tickets: boolean;
  weekly_points: number;
};
export type Sprint = {
  number: number;
  name: string;
  starts: string;
  ends: string;
  theme: string;
  notes: string;
};
export type Risk = {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  status: 'open' | 'monitoring' | 'mitigated' | 'closed' | 'materialized';
  category: string;
  owner_id: string | null;
  review_date: string | null;
  mitigation_plan: string;
  contingency_plan: string;
  related_feature_ids: string[];
  related_sprint: number | null;
};
export type Incident = {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  severity: string;
  occurred_at: string;
  resolved_at: string | null;
  risk_id: string | null;
  resolution: string;
  lessons_learned: string;
};
export type Plan = {
  backlog: {
    meta: Record<string, unknown>;
    out_of_scope: string[];
    epics: Epic[];
  };
  team: {
    meta: Record<string, unknown>;
    project: {
      name: string;
      starts: string;
      deadline: string;
      assumptions: string[];
    };
    people: Person[];
    sprints: Sprint[];
    capacity: {
      scale: string;
      allowed_estimates: number[];
      default_estimate: number;
      buffer_ratio: number;
    };
    definition_of_done: string[];
  };
  riskRegister: {
    meta: Record<string, unknown>;
    risks: Risk[];
    incidents: Incident[];
  };
};
