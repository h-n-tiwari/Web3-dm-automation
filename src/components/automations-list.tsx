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

        {/* Create Form */ }
        {showForm && (
            <form className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6 flex flex-col gap-4">
                <h2 className="text-lg font-semibold">New Automation</h2>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <input 
                    type="text"
                    placeholder="Name (e.g. Hello)"
                    required
                    className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm outline-none focus:border-indigo-500" 
                />

                <input 
                    type="text"
                    placeholder="Trigger Keyword (e.g. #giveaway)"
                    required
                    className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm outline-none focus:border-indigo-500" 
                />

                <textarea 
                    placeholder="DM to send..."
                    rows={3}
                    required
                    className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm outline-none focus:border-indigo-500" 
                />

                <button
                    type="submit"
                    className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Automation"}
                </button>



            </form>
        )}

        





    </div>
  )
}
