"use client"

import { useState, type SubmitEvent} from "react";
import axios from "axios";

type Automation = {
    id: string;
    name: string;
    platform: string;
    trigger: string;
    dmMessage: string;
    isActive: boolean;
    createdAt: Date;
}

// Handling Axios Errors
function getErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<{error?: string}>(error)) {
        return error.response?.data?.error || fallback;
    }
    return fallback;
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

    // CREATE - POST
    async function handleCreate(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data } = await axios.post<Automation>(
                "/api/automations",
                {
                    name,
                    platform: "twitter",
                    trigger,
                    dmMessage,
                }
            );

            setAutomations((prev) => [data, ...prev]);

            setName("");
            setTrigger("");
            setDmMessage("");
            setShowForm(false);

        } catch (err: unknown) {
            setError(
                getErrorMessage(err, "Failed to create automation")
            );
        } finally {
            setLoading(false);
        }
    }

    // TOGGLE - PATCH
    async function handleToggle(id: string) {
        setError("");

        try {
            const { data } = await axios.patch<Automation>(
                "/api/automations", 
                null,
                { 
                    params: { id },
                }
            );

            setAutomations((prev) => 
                prev.map((a) => (a.id === id ? data : a))
            )

        } catch (err: unknown) {
            setError(
                getErrorMessage(err, "Failed to update automation")
            );
        }

    }


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

        {/* Automations List */}
        {automations.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center text-gray-400">
                No automations yet. Create your first one above.
            </div>
        ) : (
            <div className="flex flex-col gap-3">
                {automations.map((automation) => (
                    <div key={automation.id} className="">
                        <div>
                            <p className="font-medium">{automation.name}</p>
                            <p className="mt-1 text-sm text-gray-400">
                                Trigger: <span className="text-gray-300">{automation.trigger}</span>
                            </p>
                            <p className="text-sm text-gray-400">
                                Message: <span className="text-gray-300">{automation.dmMessage}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Toggle */}
                            <button 
                                // onClick={}
                                className="">
                                Toggle
                                
                            </button>

                            {/* Delete */}
                            <button
                                // onClick={} 
                                className="">
                                Delete

                            </button>



                        </div>



                    </div>
                ))}
            </div>
        )}

        





    </div>
  )
}
