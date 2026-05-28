export interface Device {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
  production_schedule: any;
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface InspectionStandard {
  id: string;
  name: string;
  description: string;
  device_types: string[];
  items: InspectionItem[];
  frequency: string;
  role: string;
  fmea_data: any;
  created_at: string;
  updated_at: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  standard: string;
  method: string;
  tool: string;
  is_critical: boolean;
}

export interface InspectionPlan {
  id: string;
  device_id: string;
  standard_id: string;
  planned_date: string;
  status: 'draft' | 'confirmed' | 'executing' | 'completed' | 'skipped';
  conditions_check_result: any;
  skip_reason: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionTask {
  id: string;
  plan_id: string;
  device_id: string;
  executor_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  results: InspectionResult[];
  photos: string[];
  notes: string;
  skip_reason: string;
  executed_at: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionResult {
  item_id: string;
  result: 'pass' | 'fail' | 'na';
  value: string;
  notes: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}
