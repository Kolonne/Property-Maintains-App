import { getSql } from "@/lib/db";
import type { UserRole } from "@/context/UserContext";

export type DevUserRole = Exclude<UserRole, "null">;

export type DevUser = {
  id: number;
  name: string;
  email: string;
  role: DevUserRole;
};

export type DevUsersByRole = Record<DevUserRole, DevUser[]>;

export type UserProfile = {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: DevUserRole;
  created_at: string;
};

export type UserProfileInput = {
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
};

type DevUserRow = {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: DevUserRole;
};

export async function getDevUsersByRole(): Promise<DevUsersByRole> {
  const sql = getSql();

  const rows = (await sql`
    SELECT user_id, first_name, last_name, email, role
    FROM users
    WHERE role IN ('tenant', 'landlord', 'property_manager')
      AND is_active = TRUE
    ORDER BY role, first_name NULLS LAST, last_name NULLS LAST, email
  `) as DevUserRow[];

  const usersByRole: DevUsersByRole = {
    tenant: [],
    landlord: [],
    property_manager: [],
  };

  for (const row of rows) {
    const name =
      [row.first_name, row.last_name].filter(Boolean).join(" ") || row.email;

    usersByRole[row.role].push({
      id: row.user_id,
      name,
      email: row.email,
      role: row.role,
    });
  }

  return usersByRole;
}

type AuthUserRow = {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: DevUserRole;
};

export async function authenticateUser(
  email: string,
  password: string
): Promise<DevUser | null> {
  const sql = getSql();

  const rows = (await sql`
    SELECT user_id, first_name, last_name, email, role
    FROM users
    WHERE lower(email) = lower(${email})
      AND password_hash = ${password}
      AND role IN ('tenant', 'landlord', 'property_manager')
      AND is_active = TRUE
    LIMIT 1
  `) as AuthUserRow[];

  const user = rows[0];

  if (!user) {
    return null;
  }

  return {
    id: user.user_id,
    name:
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.email,
    email: user.email,
    role: user.role,
  };
}

export async function getUserProfile(
  userId: number,
  role: DevUserRole
): Promise<UserProfile | null> {
  const sql = getSql();

  const rows = (await sql`
    SELECT user_id, first_name, last_name, email, phone, role, created_at
    FROM users
    WHERE user_id = ${userId}
      AND role = ${role}
      AND is_active = TRUE
    LIMIT 1
  `) as UserProfile[];

  return rows[0] ?? null;
}

export async function updateUserProfile(
  userId: number,
  role: DevUserRole,
  input: UserProfileInput
): Promise<UserProfile | null> {
  const sql = getSql();

  const rows = (await sql`
    UPDATE users
    SET
      first_name = ${input.first_name},
      last_name = ${input.last_name},
      email = ${input.email},
      phone = ${input.phone}
    WHERE user_id = ${userId}
      AND role = ${role}
      AND is_active = TRUE
    RETURNING user_id, first_name, last_name, email, phone, role, created_at
  `) as UserProfile[];

  return rows[0] ?? null;
}
