"use client"

import { useState } from "react";

type Automation = {
    id: string;
    name: string;
    platform: string;
    trigger: string;
    dmMessage: string;
    isActive: boolean;
    createdAt: Date;
}

export default function AutomationsList({
    initialAutomations,
} : {
    initialAutomations: Automation[];
}) {

    const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>("");

    // Form State
    const [name, setName] = useState<string>("");
    const [trigger, setTrigger] = useState<string>("");
    const [dmMessage, setDmMessage] = useState<string>("");


  return (
    <div>
        {/* New Automation Button */}
        <button
        onClick={() => setShowForm(!showForm)} 
        className="mb-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium hover:bg-indigo-500 transition"
        >
            { showForm ? "Cancel" : "New Automation" }
        </button>




    </div>
  )
}
