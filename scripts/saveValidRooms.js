import { writeFileSync } from 'fs';
import { join } from 'path';
import { isValidRoom } from '../lib/roomUtils';

async function saveValidRooms(start, end) {
  const validRooms = [];
  for (let roomId = start; roomId <= end; roomId++) {
    const data = await isValidRoom(roomId);
    if (data) {
      const buildingName = data.codeY || data.codeX || data.name;
      validRooms.push({ id: roomId, building_name: buildingName });
      console.log(`Room ${roomId} is valid, building: ${buildingName}`);
    } else {
      console.log(`Room ${roomId} is invalid`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Sleep to avoid rate limiting
  }

  // Save valid IDs and building names to a JSON file
  const filePath = join(__dirname, '../lib/valid_rooms.json');
  writeFileSync(filePath, JSON.stringify(validRooms, null, 2));
}

(async () => {
  await saveValidRooms(4000, 6000);
})();
