import { getBuildingNames } from "@/lib/roomUtils";

export async function GET() {
    const buildingNames = getBuildingNames();
    return new Response(JSON.stringify({ buildingNames }), {
        headers: { "Content-Type": "application/json" },
    });
}