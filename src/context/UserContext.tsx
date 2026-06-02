"use client";

import { createContext, useContext, useState } from "react";

export type UserRole = "tenant" | "property_manager" | "landlord" | "null";

export type CurrentUser = {
    id: number | null;
    name: string;
    role: UserRole;
    email?: string;
};

const users: Record<UserRole, CurrentUser> = {
    tenant: {
        id: 1,
        name: "Test Tenant",
        role: "tenant",
    },
    property_manager: {
        id: 2,
        name: "Test Property Manager",
        role: "property_manager",
    },
    landlord: {
        id: 3,
        name: "Test Landlord",
        role: "landlord",
    },
    null: {
        id: null,
        name: "Not Logged In",
        role: "null",
    },
};

const authCookieName = "property-maintains-current-user";

function isUserRole(value: unknown): value is UserRole {
    return (
        value === "tenant" ||
        value === "property_manager" ||
        value === "landlord" ||
        value === "null"
    );
}

function normaliseUser(value: unknown): CurrentUser | null {
    if (!value || typeof value !== "object") {
        return null;
    }

    const maybeUser = value as Partial<CurrentUser>;

    if (!isUserRole(maybeUser.role)) {
        return null;
    }

    return {
        id: typeof maybeUser.id === "number" ? maybeUser.id : null,
        name: typeof maybeUser.name === "string" ? maybeUser.name : users[maybeUser.role].name,
        role: maybeUser.role,
        email: typeof maybeUser.email === "string" ? maybeUser.email : undefined,
    };
}

function readUserFromCookie(): CurrentUser | null {
    if (typeof document === "undefined") {
        return null;
    }

    const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${authCookieName}=`));

    if (!cookie) {
        return null;
    }

    try {
        const value = decodeURIComponent(cookie.split("=").slice(1).join("="));
        return normaliseUser(JSON.parse(value));
    } catch {
        return null;
    }
}

function writeUserCookie(user: CurrentUser) {
    if (typeof document === "undefined") {
        return;
    }

    if (user.role === "null") {
        document.cookie = `${authCookieName}=; path=/; max-age=0; samesite=lax`;
        return;
    }

    document.cookie = `${authCookieName}=${encodeURIComponent(
        JSON.stringify(user)
    )}; path=/; max-age=${60 * 60 * 8}; samesite=lax`;
}

type UserContextType = {
    currentUser: CurrentUser;
    setRole: (role: UserRole) => void;
    setCurrentUser: (user: CurrentUser) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUserState, setCurrentUserState] = useState<CurrentUser>(
        () => readUserFromCookie() ?? users.null
    );

    function setRole(role: UserRole) {
        setCurrentUser(users[role]);
    }

    function setCurrentUser(user: CurrentUser) {
        setCurrentUserState(user);
        writeUserCookie(user);
    }

    return (
        <UserContext.Provider value={{ currentUser: currentUserState, setRole, setCurrentUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useCurrentUser() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useCurrentUser must be used inside UserProvider");
    }

    return context;
}
