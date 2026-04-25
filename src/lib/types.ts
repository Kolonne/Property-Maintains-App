// Database row types — match db/schema.sql exactly.
// Use these as return types for queries, e.g.:
//   const rows = (await sql`SELECT * FROM users`) as User[];

export type UserRole = "tenant" | "landlord" | "property_manager" | "maintenance_staff";
export type PropertyType = "house" | "unit" | "commercial";
export type UnitStatus = "occupied" | "vacant";
export type RentFrequency = "weekly" | "fortnightly" | "monthly";
export type TenancyStatus = "active" | "expired" | "terminated";
export type RequestCategory = "plumbing" | "electrical" | "structural" | "appliance" | "pest" | "general";
export type RequestPriority = "low" | "medium" | "high" | "urgent";
export type RequestStatus =
  | "submitted"
  | "acknowledged"
  | "in_progress"
  | "awaiting_parts"
  | "completed"
  | "closed";
export type WorkOrderStatus = "assigned" | "scheduled" | "in_progress" | "completed" | "cancelled";
export type NotificationType = "email" | "sms" | "in_app";
export type InspectionStatus = "scheduled" | "completed" | "cancelled";

export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  is_active: boolean;
}

export interface Property {
  property_id: number;
  address: string;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  property_type: PropertyType | null;
  num_units: number;
  owner_id: number | null;
  created_at: string;
}

export interface Unit {
  unit_id: number;
  property_id: number;
  unit_number: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_area_sqm: string | null;
  status: UnitStatus;
  current_tenant_id: number | null;
}

export interface Tenancy {
  tenancy_id: number;
  unit_id: number;
  tenant_id: number;
  lease_start: string;
  lease_end: string | null;
  rent_amount: string | null;
  rent_frequency: RentFrequency | null;
  status: TenancyStatus;
}

export interface MaintenanceRequest {
  request_id: number;
  unit_id: number;
  reported_by: number;
  title: string;
  description: string | null;
  category: RequestCategory | null;
  priority: RequestPriority;
  status: RequestStatus;
  submitted_at: string;
  acknowledged_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
}

export interface RequestImage {
  image_id: number;
  request_id: number;
  file_path: string;
  uploaded_at: string;
  uploaded_by: number | null;
}

export interface Contractor {
  contractor_id: number;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  abn: string | null;
  specialties: string[] | null;
  hourly_rate: string | null;
  is_preferred: boolean;
  license_number: string | null;
}

export interface WorkOrder {
  work_order_id: number;
  request_id: number;
  assigned_to_user_id: number | null;
  assigned_to_contractor_id: number | null;
  assigned_by: number | null;
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  estimated_cost: string | null;
  actual_cost: string | null;
  status: WorkOrderStatus;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface WorkOrderMaterial {
  material_id: number;
  work_order_id: number;
  description: string;
  quantity: number;
  unit_cost: string | null;
  supplier: string | null;
}

export interface Comment {
  comment_id: number;
  request_id: number;
  user_id: number;
  comment_text: string;
  is_internal: boolean;
  created_at: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  request_id: number | null;
  type: NotificationType;
  message: string;
  sent_at: string;
  read_at: string | null;
}

export interface AuditLog {
  log_id: number;
  request_id: number;
  changed_by: number | null;
  old_status: string | null;
  new_status: string | null;
  changed_at: string;
  notes: string | null;
}

export interface Inspection {
  inspection_id: number;
  property_id: number;
  inspector_id: number | null;
  scheduled_date: string;
  completed_date: string | null;
  report_notes: string | null;
  status: InspectionStatus;
}

export interface RecurringMaintenance {
  schedule_id: number;
  property_id: number;
  task_description: string;
  frequency_days: number;
  last_completed: string | null;
  next_due: string | null;
  assigned_contractor_id: number | null;
}
