import { getSql } from "@/lib/db";
import type {
  CommentChannel,
  MaintenanceQuote,
  MaintenanceRequest,
  RequestCategory,
  RequestPriority,
  RequestStatus,
  UserRole,
} from "@/lib/types";

export type MaintenanceUnitOption = {
  unit_id: number;
  label: string;
};

export type CreateMaintenanceRequestInput = {
  unit_id: number;
  reported_by: number;
  title: string;
  description: string | null;
  category: RequestCategory | null;
  priority: RequestPriority;
};

export type MaintenanceRequestDetail = MaintenanceRequest & {
  property_address: string;
  property_suburb: string | null;
  unit_number: string | null;
  reporter_first_name: string | null;
  reporter_last_name: string | null;
  reporter_email: string;
  reporter_role: UserRole;
  image_count: number;
  images: Array<{
    image_id: number;
    file_path: string;
    uploaded_at: string;
  }>;
  estimated_cost: string | null;
  actual_cost: string | null;
  work_order_status: string | null;
  work_order_notes: string | null;
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  approved_quote_contractor_name: string | null;
  approved_quote_quoted_amount: string | null;
  approved_quote_availability_note: string | null;
};

export type MaintenanceMessage = {
  comment_id: number;
  request_id: number;
  user_id: number;
  comment_text: string;
  is_internal: boolean;
  channel: CommentChannel;
  created_at: string;
  sender_first_name: string | null;
  sender_last_name: string | null;
  sender_email: string;
  sender_role: UserRole;
};

export type MaintenanceRequestQuote = MaintenanceQuote & {
  creator_first_name: string | null;
  creator_last_name: string | null;
  creator_email: string;
};

export type CreateMaintenanceQuoteInput = {
  requestId: number;
  createdBy: number;
  contractorName: string;
  quotedAmount: string;
  availabilityNote: string | null;
  quoteNotes: string | null;
  isPreapprovedContractor: boolean;
};

export type MaintenanceStatusUpdate = {
  status: RequestStatus;
  approved_quote_id: number | null;
  approved_by: number | null;
  acknowledged_at: string | null;
  in_progress_at: string | null;
  awaiting_landlord_approval_at: string | null;
  landlord_approved_at: string | null;
  invoice_received_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
};

export type MaintenanceApprovalUpdate = {
  status: MaintenanceStatusUpdate;
  quote: MaintenanceRequestQuote;
};

export type MaintenanceRequestListItem = MaintenanceRequest & {
  property_address: string;
  property_suburb: string | null;
  unit_number: string | null;
  reporter_first_name: string | null;
  reporter_last_name: string | null;
};

type UnitOptionRow = {
  unit_id: number;
  address: string;
  suburb: string | null;
  unit_number: string | null;
};

function formatUnitLabel(row: UnitOptionRow) {
  const unitLabel = row.unit_number ? `Unit ${row.unit_number}` : "House";
  const suburb = row.suburb ? `, ${row.suburb}` : "";

  return `${row.address}${suburb} - ${unitLabel}`;
}

export async function getMaintenanceUnitOptions(
  userId: number,
  role: UserRole
): Promise<MaintenanceUnitOption[]> {
  const sql = getSql();

  if (role === "tenant") {
    const rows = (await sql`
      SELECT u.unit_id, p.address, p.suburb, u.unit_number
      FROM tenancies t
      JOIN units u ON u.unit_id = t.unit_id
      JOIN properties p ON p.property_id = u.property_id
      WHERE t.tenant_id = ${userId}
        AND t.status = 'active'
      ORDER BY p.address, u.unit_number
    `) as UnitOptionRow[];

    return rows.map((row) => ({
      unit_id: row.unit_id,
      label: formatUnitLabel(row),
    }));
  }

  if (role === "property_manager") {
    const rows = (await sql`
      SELECT u.unit_id, p.address, p.suburb, u.unit_number
      FROM units u
      JOIN properties p ON p.property_id = u.property_id
      ORDER BY p.address, u.unit_number
    `) as UnitOptionRow[];

    return rows.map((row) => ({
      unit_id: row.unit_id,
      label: formatUnitLabel(row),
    }));
  }

  if (role === "landlord") {
    const rows = (await sql`
      SELECT u.unit_id, p.address, p.suburb, u.unit_number
      FROM units u
      JOIN properties p ON p.property_id = u.property_id
      WHERE p.owner_id = ${userId}
      ORDER BY p.address, u.unit_number
    `) as UnitOptionRow[];

    return rows.map((row) => ({
      unit_id: row.unit_id,
      label: formatUnitLabel(row),
    }));
  }

  return [];
}

export async function getMaintenanceRequests(
  userId: number,
  role: UserRole
): Promise<MaintenanceRequestListItem[]> {
  const sql = getSql();

  if (role === "tenant") {
    return (await sql`
      SELECT
        mr.request_id,
        mr.unit_id,
        mr.reported_by,
        mr.title,
        mr.description,
        mr.category,
        mr.priority,
        mr.status,
        mr.approved_quote_id,
        mr.approved_by,
        mr.submitted_at,
        mr.acknowledged_at,
        mr.in_progress_at,
        mr.awaiting_landlord_approval_at,
        mr.landlord_approved_at,
        mr.invoice_received_at,
        mr.completed_at,
        mr.closed_at,
        p.address AS property_address,
        p.suburb AS property_suburb,
        u.unit_number,
        reporter.first_name AS reporter_first_name,
        reporter.last_name AS reporter_last_name
      FROM maintenance_requests mr
      JOIN units u ON u.unit_id = mr.unit_id
      JOIN properties p ON p.property_id = u.property_id
      JOIN users reporter ON reporter.user_id = mr.reported_by
      WHERE EXISTS (
        SELECT 1
        FROM tenancies t
        WHERE t.unit_id = mr.unit_id
          AND t.tenant_id = ${userId}
          AND t.status = 'active'
      )
      ORDER BY mr.submitted_at DESC
    `) as MaintenanceRequestListItem[];
  }

  if (role === "landlord") {
    return (await sql`
      SELECT
        mr.request_id,
        mr.unit_id,
        mr.reported_by,
        mr.title,
        mr.description,
        mr.category,
        mr.priority,
        mr.status,
        mr.approved_quote_id,
        mr.approved_by,
        mr.submitted_at,
        mr.acknowledged_at,
        mr.in_progress_at,
        mr.awaiting_landlord_approval_at,
        mr.landlord_approved_at,
        mr.invoice_received_at,
        mr.completed_at,
        mr.closed_at,
        p.address AS property_address,
        p.suburb AS property_suburb,
        u.unit_number,
        reporter.first_name AS reporter_first_name,
        reporter.last_name AS reporter_last_name
      FROM maintenance_requests mr
      JOIN units u ON u.unit_id = mr.unit_id
      JOIN properties p ON p.property_id = u.property_id
      JOIN users reporter ON reporter.user_id = mr.reported_by
      WHERE p.owner_id = ${userId}
      ORDER BY mr.submitted_at DESC
    `) as MaintenanceRequestListItem[];
  }

  if (role === "property_manager") {
    return (await sql`
      SELECT
        mr.request_id,
        mr.unit_id,
        mr.reported_by,
        mr.title,
        mr.description,
        mr.category,
        mr.priority,
        mr.status,
        mr.approved_quote_id,
        mr.approved_by,
        mr.submitted_at,
        mr.acknowledged_at,
        mr.in_progress_at,
        mr.awaiting_landlord_approval_at,
        mr.landlord_approved_at,
        mr.invoice_received_at,
        mr.completed_at,
        mr.closed_at,
        p.address AS property_address,
        p.suburb AS property_suburb,
        u.unit_number,
        reporter.first_name AS reporter_first_name,
        reporter.last_name AS reporter_last_name
      FROM maintenance_requests mr
      JOIN units u ON u.unit_id = mr.unit_id
      JOIN properties p ON p.property_id = u.property_id
      JOIN users reporter ON reporter.user_id = mr.reported_by
      ORDER BY mr.submitted_at DESC
    `) as MaintenanceRequestListItem[];
  }

  return [];
}

export async function createMaintenanceRequest(
  input: CreateMaintenanceRequestInput
): Promise<MaintenanceRequest> {
  const sql = getSql();

  const rows = (await sql`
    INSERT INTO maintenance_requests (
      unit_id,
      reported_by,
      title,
      description,
      category,
      priority
    )
    VALUES (
      ${input.unit_id},
      ${input.reported_by},
      ${input.title},
      ${input.description},
      ${input.category},
      ${input.priority}
    )
    RETURNING
      request_id,
      unit_id,
      reported_by,
      title,
      description,
      category,
      priority,
      status,
      approved_quote_id,
      approved_by,
      submitted_at,
      acknowledged_at,
      in_progress_at,
      awaiting_landlord_approval_at,
      landlord_approved_at,
      invoice_received_at,
      completed_at,
      closed_at
  `) as MaintenanceRequest[];

  return rows[0];
}

export async function getMaintenanceMessages(
  requestId: number,
  channel: CommentChannel
): Promise<MaintenanceMessage[]> {
  const sql = getSql();

  return (await sql`
    SELECT
      c.comment_id,
      c.request_id,
      c.user_id,
      c.comment_text,
      c.is_internal,
      c.channel,
      c.created_at,
      sender.first_name AS sender_first_name,
      sender.last_name AS sender_last_name,
      sender.email AS sender_email,
      sender.role AS sender_role
    FROM comments c
    JOIN users sender ON sender.user_id = c.user_id
    WHERE c.request_id = ${requestId}
      AND c.channel = ${channel}
    ORDER BY c.created_at ASC, c.comment_id ASC
  `) as MaintenanceMessage[];
}

export async function createMaintenanceMessage(
  requestId: number,
  userId: number,
  messageBody: string,
  channel: CommentChannel
): Promise<MaintenanceMessage> {
  const sql = getSql();

  const rows = (await sql`
    WITH inserted AS (
      INSERT INTO comments (
        request_id,
        user_id,
        comment_text,
        is_internal,
        channel
      )
      VALUES (
        ${requestId},
        ${userId},
        ${messageBody},
        ${channel === "internal"},
        ${channel}
      )
      RETURNING
        comment_id,
        request_id,
        user_id,
        comment_text,
        is_internal,
        channel,
        created_at
    )
    SELECT
      inserted.comment_id,
      inserted.request_id,
      inserted.user_id,
      inserted.comment_text,
      inserted.is_internal,
      inserted.channel,
      inserted.created_at,
      sender.first_name AS sender_first_name,
      sender.last_name AS sender_last_name,
      sender.email AS sender_email,
      sender.role AS sender_role
    FROM inserted
    JOIN users sender ON sender.user_id = inserted.user_id
  `) as MaintenanceMessage[];

  return rows[0];
}

export async function getMaintenanceQuotes(
  requestId: number
): Promise<MaintenanceRequestQuote[]> {
  const sql = getSql();

  return (await sql`
    SELECT
      mq.quote_id,
      mq.request_id,
      mq.contractor_name,
      mq.quoted_amount::text AS quoted_amount,
      mq.availability_note,
      mq.quote_notes,
      mq.is_preapproved_contractor,
      mq.created_by,
      mq.created_at,
      creator.first_name AS creator_first_name,
      creator.last_name AS creator_last_name,
      creator.email AS creator_email
    FROM maintenance_quotes mq
    JOIN users creator ON creator.user_id = mq.created_by
    WHERE mq.request_id = ${requestId}
    ORDER BY mq.created_at ASC, mq.quote_id ASC
  `) as MaintenanceRequestQuote[];
}

export async function createMaintenanceQuote(
  input: CreateMaintenanceQuoteInput
): Promise<MaintenanceRequestQuote> {
  const sql = getSql();

  const rows = (await sql`
    WITH inserted AS (
      INSERT INTO maintenance_quotes (
        request_id,
        contractor_name,
        quoted_amount,
        availability_note,
        quote_notes,
        is_preapproved_contractor,
        created_by
      )
      VALUES (
        ${input.requestId},
        ${input.contractorName},
        ${input.quotedAmount},
        ${input.availabilityNote},
        ${input.quoteNotes},
        ${input.isPreapprovedContractor},
        ${input.createdBy}
      )
      RETURNING
        quote_id,
        request_id,
        contractor_name,
        quoted_amount,
        availability_note,
        quote_notes,
        is_preapproved_contractor,
        created_by,
        created_at
    )
    SELECT
      inserted.quote_id,
      inserted.request_id,
      inserted.contractor_name,
      inserted.quoted_amount::text AS quoted_amount,
      inserted.availability_note,
      inserted.quote_notes,
      inserted.is_preapproved_contractor,
      inserted.created_by,
      inserted.created_at,
      creator.first_name AS creator_first_name,
      creator.last_name AS creator_last_name,
      creator.email AS creator_email
    FROM inserted
    JOIN users creator ON creator.user_id = inserted.created_by
  `) as MaintenanceRequestQuote[];

  return rows[0];
}

export async function getMaintenanceQuoteRequirement(requestId: number): Promise<{
  isRequirementMet: boolean;
  quoteCount: number;
  hasPreapprovedQuote: boolean;
}> {
  const sql = getSql();

  const rows = (await sql`
    SELECT
      COUNT(*)::int AS quote_count,
      BOOL_OR(is_preapproved_contractor) AS has_preapproved_quote
    FROM maintenance_quotes
    WHERE request_id = ${requestId}
  `) as Array<{
    quote_count: number;
    has_preapproved_quote: boolean | null;
  }>;

  const quoteCount = rows[0]?.quote_count ?? 0;
  const hasPreapprovedQuote = rows[0]?.has_preapproved_quote === true;

  return {
    isRequirementMet: quoteCount >= 3 || hasPreapprovedQuote,
    quoteCount,
    hasPreapprovedQuote,
  };
}

export async function updateMaintenanceRequestStatus(
  requestId: number,
  nextStatus: RequestStatus
): Promise<MaintenanceStatusUpdate> {
  const sql = getSql();

  const rows = (await sql`
    UPDATE maintenance_requests
    SET
      status = ${nextStatus},
      acknowledged_at = CASE
        WHEN ${nextStatus} = 'acknowledged' THEN COALESCE(acknowledged_at, NOW())
        ELSE acknowledged_at
      END,
      in_progress_at = CASE
        WHEN ${nextStatus} = 'in_progress' THEN COALESCE(in_progress_at, NOW())
        ELSE in_progress_at
      END,
      awaiting_landlord_approval_at = CASE
        WHEN ${nextStatus} = 'awaiting_landlord_approval' THEN COALESCE(awaiting_landlord_approval_at, NOW())
        ELSE awaiting_landlord_approval_at
      END,
      landlord_approved_at = CASE
        WHEN ${nextStatus} = 'landlord_approved' THEN COALESCE(landlord_approved_at, NOW())
        ELSE landlord_approved_at
      END,
      completed_at = CASE
        WHEN ${nextStatus} = 'completed' THEN COALESCE(completed_at, NOW())
        ELSE completed_at
      END,
      closed_at = CASE
        WHEN ${nextStatus} = 'closed' THEN COALESCE(closed_at, NOW())
        ELSE closed_at
      END
    WHERE request_id = ${requestId}
    RETURNING
      status,
      approved_quote_id,
      approved_by,
      acknowledged_at,
      in_progress_at,
      awaiting_landlord_approval_at,
      landlord_approved_at,
      invoice_received_at,
      completed_at,
      closed_at
  `) as MaintenanceStatusUpdate[];

  return rows[0];
}

export async function markMaintenanceInvoiceReceived(
  requestId: number
): Promise<MaintenanceStatusUpdate> {
  const sql = getSql();

  const rows = (await sql`
    UPDATE maintenance_requests
    SET invoice_received_at = COALESCE(invoice_received_at, NOW())
    WHERE request_id = ${requestId}
    RETURNING
      status,
      approved_quote_id,
      approved_by,
      acknowledged_at,
      in_progress_at,
      awaiting_landlord_approval_at,
      landlord_approved_at,
      invoice_received_at,
      completed_at,
      closed_at
  `) as MaintenanceStatusUpdate[];

  return rows[0];
}

export async function approveMaintenanceRequestQuote(
  requestId: number,
  quoteId: number,
  approvedBy: number
): Promise<MaintenanceApprovalUpdate | null> {
  const sql = getSql();

  const rows = (await sql`
    WITH selected_quote AS (
      SELECT
        mq.quote_id,
        mq.request_id,
        mq.contractor_name,
        mq.quoted_amount,
        mq.availability_note,
        mq.quote_notes,
        mq.is_preapproved_contractor,
        mq.created_by,
        mq.created_at,
        creator.first_name AS creator_first_name,
        creator.last_name AS creator_last_name,
        creator.email AS creator_email
      FROM maintenance_quotes mq
      JOIN users creator ON creator.user_id = mq.created_by
      WHERE mq.request_id = ${requestId}
        AND mq.quote_id = ${quoteId}
    ),
    updated_request AS (
      UPDATE maintenance_requests
      SET
        status = 'landlord_approved',
        approved_quote_id = ${quoteId},
        approved_by = ${approvedBy},
        acknowledged_at = COALESCE(acknowledged_at, NOW()),
        in_progress_at = COALESCE(in_progress_at, NOW()),
        landlord_approved_at = COALESCE(landlord_approved_at, NOW())
      WHERE request_id = ${requestId}
        AND EXISTS (SELECT 1 FROM selected_quote)
      RETURNING
        status,
        approved_quote_id,
        approved_by,
        acknowledged_at,
        in_progress_at,
        awaiting_landlord_approval_at,
        landlord_approved_at,
        invoice_received_at,
        completed_at,
        closed_at
    )
    SELECT
      updated_request.status,
      updated_request.approved_quote_id,
      updated_request.approved_by,
      updated_request.acknowledged_at,
      updated_request.in_progress_at,
      updated_request.awaiting_landlord_approval_at,
      updated_request.landlord_approved_at,
      updated_request.invoice_received_at,
      updated_request.completed_at,
      updated_request.closed_at,
      selected_quote.quote_id,
      selected_quote.request_id,
      selected_quote.contractor_name,
      selected_quote.quoted_amount::text AS quoted_amount,
      selected_quote.availability_note,
      selected_quote.quote_notes,
      selected_quote.is_preapproved_contractor,
      selected_quote.created_by,
      selected_quote.created_at,
      selected_quote.creator_first_name,
      selected_quote.creator_last_name,
      selected_quote.creator_email
    FROM updated_request
    JOIN selected_quote ON TRUE
  `) as Array<MaintenanceStatusUpdate & MaintenanceRequestQuote>;

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    status: {
      status: row.status,
      approved_quote_id: row.approved_quote_id,
      approved_by: row.approved_by,
      acknowledged_at: row.acknowledged_at,
      in_progress_at: row.in_progress_at,
      awaiting_landlord_approval_at: row.awaiting_landlord_approval_at,
      landlord_approved_at: row.landlord_approved_at,
      invoice_received_at: row.invoice_received_at,
      completed_at: row.completed_at,
      closed_at: row.closed_at,
    },
    quote: {
      quote_id: row.quote_id,
      request_id: row.request_id,
      contractor_name: row.contractor_name,
      quoted_amount: row.quoted_amount,
      availability_note: row.availability_note,
      quote_notes: row.quote_notes,
      is_preapproved_contractor: row.is_preapproved_contractor,
      created_by: row.created_by,
      created_at: row.created_at,
      creator_first_name: row.creator_first_name,
      creator_last_name: row.creator_last_name,
      creator_email: row.creator_email,
    },
  };
}

export async function progressMaintenanceRequestAfterQuote(
  requestId: number
): Promise<MaintenanceStatusUpdate | null> {
  const sql = getSql();
  const requirement = await getMaintenanceQuoteRequirement(requestId);

  if (requirement.isRequirementMet) {
    const rows = (await sql`
      UPDATE maintenance_requests
      SET
        status = 'awaiting_landlord_approval',
        in_progress_at = COALESCE(in_progress_at, NOW()),
        acknowledged_at = COALESCE(acknowledged_at, NOW()),
        awaiting_landlord_approval_at = COALESCE(awaiting_landlord_approval_at, NOW())
      WHERE request_id = ${requestId}
        AND status IN ('submitted', 'acknowledged', 'in_progress')
      RETURNING
        status,
        approved_quote_id,
        approved_by,
        acknowledged_at,
        in_progress_at,
        awaiting_landlord_approval_at,
        landlord_approved_at,
        invoice_received_at,
        completed_at,
        closed_at
    `) as MaintenanceStatusUpdate[];

    return rows[0] ?? null;
  }

  const rows = (await sql`
    UPDATE maintenance_requests
    SET
      status = 'in_progress',
      acknowledged_at = COALESCE(acknowledged_at, NOW()),
      in_progress_at = COALESCE(in_progress_at, NOW())
    WHERE request_id = ${requestId}
      AND status IN ('submitted', 'acknowledged')
    RETURNING
      status,
      approved_quote_id,
      approved_by,
      acknowledged_at,
      in_progress_at,
      awaiting_landlord_approval_at,
      landlord_approved_at,
      invoice_received_at,
      completed_at,
      closed_at
  `) as MaintenanceStatusUpdate[];

  return rows[0] ?? null;
}

export async function getMaintenanceRequestDetail(
  requestId: number,
  userId: number,
  role: UserRole
): Promise<MaintenanceRequestDetail | null> {
  const sql = getSql();

  const rows = (await sql`
    SELECT
      mr.request_id,
      mr.unit_id,
      mr.reported_by,
      mr.title,
      mr.description,
      mr.category,
      mr.priority,
      mr.status,
      mr.approved_quote_id,
      mr.approved_by,
      mr.submitted_at,
      mr.acknowledged_at,
      mr.in_progress_at,
      mr.awaiting_landlord_approval_at,
      mr.landlord_approved_at,
      mr.invoice_received_at,
      mr.completed_at,
      mr.closed_at,
      p.address AS property_address,
      p.suburb AS property_suburb,
      u.unit_number,
      reporter.first_name AS reporter_first_name,
      reporter.last_name AS reporter_last_name,
      reporter.email AS reporter_email,
      reporter.role AS reporter_role,
      COALESCE(image_summary.image_count, 0)::int AS image_count,
      COALESCE(image_summary.images, '[]'::json) AS images,
      latest_work_order.estimated_cost::text AS estimated_cost,
      latest_work_order.actual_cost::text AS actual_cost,
      latest_work_order.status AS work_order_status,
      latest_work_order.notes AS work_order_notes,
      latest_work_order.scheduled_date::text AS scheduled_date,
      latest_work_order.scheduled_time_slot,
      approved_quote.contractor_name AS approved_quote_contractor_name,
      approved_quote.quoted_amount::text AS approved_quote_quoted_amount,
      approved_quote.availability_note AS approved_quote_availability_note
    FROM maintenance_requests mr
    JOIN units u ON u.unit_id = mr.unit_id
    JOIN properties p ON p.property_id = u.property_id
    JOIN users reporter ON reporter.user_id = mr.reported_by
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::int AS image_count,
        json_agg(
          json_build_object(
            'image_id', ri.image_id,
            'file_path', ri.file_path,
            'uploaded_at', ri.uploaded_at
          )
          ORDER BY ri.uploaded_at DESC
        ) AS images
      FROM request_images ri
      WHERE ri.request_id = mr.request_id
    ) image_summary ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        wo.estimated_cost,
        wo.actual_cost,
        wo.status,
        wo.notes,
        wo.scheduled_date,
        wo.scheduled_time_slot
      FROM work_orders wo
      WHERE wo.request_id = mr.request_id
      ORDER BY wo.created_at DESC, wo.work_order_id DESC
      LIMIT 1
    ) latest_work_order ON TRUE
    LEFT JOIN maintenance_quotes approved_quote
      ON approved_quote.quote_id = mr.approved_quote_id
      AND approved_quote.request_id = mr.request_id
    WHERE mr.request_id = ${requestId}
      AND (
        (
          ${role} = 'tenant'
          AND EXISTS (
            SELECT 1
            FROM tenancies t
            WHERE t.unit_id = mr.unit_id
              AND t.tenant_id = ${userId}
              AND t.status = 'active'
          )
        )
        OR (${role} = 'property_manager')
        OR (${role} = 'landlord' AND p.owner_id = ${userId})
      )
    LIMIT 1
  `) as MaintenanceRequestDetail[];

  return rows[0] ?? null;
}
