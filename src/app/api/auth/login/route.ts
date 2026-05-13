import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/queries/users";

const authCookieName = "property-maintains-current-user";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ user });

    response.cookies.set(authCookieName, JSON.stringify(user), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Failed to log in", error);

    return NextResponse.json(
      { error: "Failed to log in." },
      { status: 500 }
    );
  }
}
