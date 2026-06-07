import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createMaintenanceMessage,
  getMaintenanceMessages,
  getMaintenanceRequestDetail,
  type MaintenanceMessage,
} from "@/lib/queries/maintenance";
import type { CommentChannel, UserRole } from "@/lib/types";

const roles: UserRole[] = ["tenant", "landlord", "property_manager"];
const channels: CommentChannel[] = ["landlord", "tenant", "internal"];

type ClientMaintenanceMessage = {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: UserRole;
  body: string;
  channel: CommentChannel;
  createdAt: string;
};

function getValidUserRole(value: string | null): UserRole | null {
  return roles.includes(value as UserRole) ? (value as UserRole) : null;
}

function getValidChannel(value: string | null): CommentChannel | null {
  return channels.includes(value as CommentChannel)
    ? (value as CommentChannel)
    : null;
}

function resolveChannel(
  role: UserRole,
  requestedChannel: string | null
):
  | { channel: CommentChannel }
  | { error: ReturnType<typeof NextResponse.json> } {
  const channel = getValidChannel(requestedChannel);

  if (role === "property_manager") {
    if (!requestedChannel) {
      return { channel: "landlord" };
    }

    if (!channel) {
      return {
        error: NextResponse.json(
          { error: "A valid chat channel is required." },
          { status: 400 }
        ),
      };
    }

    return { channel };
  }

  const allowedChannel: CommentChannel =
    role === "tenant" ? "tenant" : "landlord";

  if (requestedChannel && requestedChannel !== allowedChannel) {
    return {
      error: NextResponse.json(
        { error: "You are not authorised to access this chat channel." },
        { status: 403 }
      ),
    };
  }

  return { channel: allowedChannel };
}

function getSenderName(message: MaintenanceMessage, viewerRole: UserRole) {
  if (viewerRole === "landlord" && message.sender_role === "tenant") {
    return "Tenant";
  }

  const fullName = [message.sender_first_name, message.sender_last_name]
    .filter(Boolean)
    .join(" ");

  return fullName || message.sender_email;
}

function toClientMessage(
  message: MaintenanceMessage,
  viewerRole: UserRole
): ClientMaintenanceMessage {
  return {
    id: message.comment_id,
    senderId: message.user_id,
    senderName: getSenderName(message, viewerRole),
    senderRole: message.sender_role,
    body: message.comment_text,
    channel: message.channel,
    createdAt: message.created_at,
  };
}

async function validateAccess(request: NextRequest, requestId: number) {
  const userId = Number(request.nextUrl.searchParams.get("userId"));
  const role = getValidUserRole(request.nextUrl.searchParams.get("role"));

  if (!requestId || !userId || !role) {
    return {
      error: NextResponse.json(
        { error: "A valid request id, userId, and role are required." },
        { status: 400 }
      ),
    };
  }

  const maintenanceRequest = await getMaintenanceRequestDetail(
    requestId,
    userId,
    role
  );

  if (!maintenanceRequest) {
    return {
      error: NextResponse.json(
        { error: "Maintenance request not found or access denied." },
        { status: 404 }
      ),
    };
  }

  return { userId, role };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = Number(id);

  try {
    const access = await validateAccess(request, requestId);

    if ("error" in access) {
      return access.error;
    }

    const channelResult = resolveChannel(
      access.role,
      request.nextUrl.searchParams.get("channel")
    );

    if ("error" in channelResult) {
      return channelResult.error;
    }

    const messages = await getMaintenanceMessages(
      requestId,
      channelResult.channel
    );

    return NextResponse.json({
      channel: channelResult.channel,
      messages: messages.map((message) =>
        toClientMessage(message, access.role)
      ),
    });
  } catch (error) {
    console.error("Failed to load maintenance messages", error);

    return NextResponse.json(
      { error: "Failed to load maintenance messages." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = Number(id);

  try {
    const access = await validateAccess(request, requestId);

    if ("error" in access) {
      return access.error;
    }

    const channelResult = resolveChannel(
      access.role,
      request.nextUrl.searchParams.get("channel")
    );

    if ("error" in channelResult) {
      return channelResult.error;
    }

    const body = (await request.json()) as { message?: unknown };
    const messageBody =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!messageBody) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    const message = await createMaintenanceMessage(
      requestId,
      access.userId,
      messageBody,
      channelResult.channel
    );

    return NextResponse.json(
      { message: toClientMessage(message, access.role) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create maintenance message", error);

    return NextResponse.json(
      { error: "Failed to send maintenance message." },
      { status: 500 }
    );
  }
}
