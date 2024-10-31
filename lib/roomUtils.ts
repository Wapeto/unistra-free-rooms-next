import { parse, isSameDay } from "date-fns";
import cachedRooms from "./validRooms.json";

interface Room {
  id: number;
  building_name: string;
}

interface Event {
  date: string;
  startHour: string;
  endHour: string;
}

interface RoomJson {
  name: string;
  events: {
    events: Event[];
  };
}

const roomJsonCache: Record<number, RoomJson> = {};

function getHeaders(roomId: number) {
  return {
    Accept: "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    Referer: `https://monemploidutemps.unistra.fr/public/${roomId}`,
    "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
    DNT: "1",
    Connection: "keep-alive",
  };
}

async function getRoomJson(roomId: number): Promise<RoomJson | null> {
  const url = `https://monemploidutemps.unistra.fr/api/events/${roomId}.json`;
  const headers = getHeaders(roomId);

  try {
    const response = await fetch(url, { headers });
    if (response.status === 200) {
      return await response.json();
    } else {
      console.error(
        `Failed to fetch room ${roomId}: Status ${response.status}`
      );
      return null;
    }
  } catch (error) {
    console.error(`Error fetching room ${roomId}:`, error);
    return null;
  }
}

function getRoomsFromBuilding(buildingName: string): Room[] {
  return cachedRooms.filter(
    (room: Room) => room.building_name === buildingName
  );
}

export async function getFreeRooms(
  buildingName: string,
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string
): Promise<[string, number][]> {
  const roomsInBuilding = getRoomsFromBuilding(buildingName);
  const freeRooms: [string, number][] = [];

  // Convert input date and times to Date objects
  const dateObj = parse(dateStr, "d/M/yyyy", new Date());
  const inputStartTime = parse(startTimeStr, "H:mm", new Date());
  const inputEndTime = parse(endTimeStr, "H:mm", new Date());

  for (const room of roomsInBuilding) {
    const roomId = room.id;
    let roomJson = roomJsonCache[roomId];
    if (!roomJson) {
      const fetchedRoomJson = await getRoomJson(roomId);
      if (!fetchedRoomJson) continue;
      roomJson = fetchedRoomJson;
      roomJsonCache[roomId] = roomJson;
    }

    const events = roomJson.events?.events || [];
    let isFree = true;

    for (const event of events) {
      const eventDateObj = parse(event.date, "d/M/yyyy", new Date());
      const eventStartTime = parse(event.startHour, "H:mm", new Date());
      const eventEndTime = parse(event.endHour, "H:mm", new Date());

      if (!isSameDay(eventDateObj, dateObj)) {
        continue; // Skip events on different dates
      }

      // Check for time overlap
      if (eventStartTime < inputEndTime && inputStartTime < eventEndTime) {
        // Times overlap; room is occupied
        isFree = false;
        break;
      }
    }

    if (isFree) {
      freeRooms.push([roomJson.name, roomId]);
    }

    // Optionally add a delay to avoid rate limiting
    // await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return freeRooms;
}

function getBuildingNames() {
  const b = cachedRooms.map((room: Room) => room.building_name);
  return b.filter((value, index) => b.indexOf(value) === index).sort();
}

export { getHeaders, getRoomJson, getRoomsFromBuilding, getBuildingNames };
