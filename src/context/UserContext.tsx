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

type UserContextType = {
    currentUser: CurrentUser;
    setRole: (role: UserRole) => void;
    setCurrentUser: (user: CurrentUser) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<CurrentUser>(users.tenant);

    function setRole(role: UserRole) {
        setCurrentUser(users[role]);
    }

    return (
        <UserContext.Provider value={{ currentUser, setRole, setCurrentUser }}>
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
