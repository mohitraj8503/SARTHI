"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSpeakerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        bio: "",
        designation: "",
        linkedin: "",
        twitter: "",
        photo: "",
        expertise: "",  // comma-separated, e.g. "React, System Design, DSA"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/speakers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    expertise: form.expertise.split(",").map((s) => s.trim()).filter(Boolean),
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            router.push("/admin/speakers");
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Add New Speaker</h1>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <p className="font-semibold mb-1">📋 How this works:</p>
                <p>
                    Adding a speaker here creates their profile on SARTHI. They&apos;ll appear
                    as the speaker for whichever seminar you assign them to. They do <strong>not</strong> get
                    admin access — only a speaker profile page.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Saurav Kumar"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="saurav@example.com"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation
                    </label>
                    <input
                        type="text"
                        value={form.designation}
                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                        placeholder="Senior Engineer at Google"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder="Brief bio about the speaker — their experience, achievements..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm h-28 resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Areas of Expertise (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={form.expertise}
                        onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                        placeholder="System Design, React, DSA, Backend"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                        <input
                            type="url"
                            value={form.linkedin}
                            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                            placeholder="https://linkedin.com/in/saurav"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                        <input
                            type="url"
                            value={form.photo}
                            onChange={(e) => setForm({ ...form, photo: e.target.value })}
                            placeholder="https://example.com/saurav.jpg"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl transition"
                >
                    {loading ? "Creating Speaker Profile..." : "Create Speaker Profile"}
                </button>
            </form>
        </div>
    );
}

