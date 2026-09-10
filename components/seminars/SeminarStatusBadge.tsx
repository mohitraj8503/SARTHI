export default function LiveStatusBadge({
    status,
}: {
    status: "SCHEDULED" | "LIVE" | "ENDED";
}) {
    if (status === "LIVE") {
        return (
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full" />
                LIVE NOW
            </span>
        );
    }
    if (status === "SCHEDULED") {
        return (
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                UPCOMING
            </span>
        );
    }
    return (
        <span className="bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            ENDED
        </span>
    );
}

