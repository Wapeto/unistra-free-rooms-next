import { NextRequest } from "next/server";
import { getFreeRooms } from "@/lib/roomUtils";

export async function POST(request: NextRequest) {
  const { buildingName, date, startTime, endTime } = await request.json();

  if (!buildingName || !date || !startTime || !endTime) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    const freeRooms = await getFreeRooms(
      buildingName,
      date,
      startTime,
      endTime
    );
    console.log(
      "Found " +
        freeRooms.length +
        " between " +
        startTime +
        " and " +
        endTime +
        " on " +
        date +
        " in " +
        buildingName
    );
    return new Response(JSON.stringify({ freeRooms }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
