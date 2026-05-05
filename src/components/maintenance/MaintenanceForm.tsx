// MaintenanceForm.tsx
// Purpose: Form for creating or editing a maintenance request.
// Current user is available as a prop to pre-fill tenant info and associate the request with the user. :D

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/context/UserContext";

type MaintenanceFormProps = {
    currentUser: CurrentUser;
};

// To confirm what to include in the form, we can refer to the maintenance request interface in src/lib/types.ts.

export default function MaintenanceForm({ currentUser }: MaintenanceFormProps) {

    return (
        <div>
            <p>Form Here :)</p>
            <p>Importing current user as <i>currentUser</i> for you to keep user's data to be stored upon form commit</p>
        </div>

    );
}

