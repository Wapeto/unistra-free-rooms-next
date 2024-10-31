"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import { format } from "date-fns";
import TimePicker from "react-time-picker";

import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";

registerLocale("fr", fr);

export default function Home() {
  const [buildingName, setBuildingName] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [freeRooms, setFreeRooms] = useState<[string, number][]>([]);
  const [buildingsList, setBuildingsList] = useState<string[]>([]);

  const fetchBuildings = async () => {
    const response = await fetch("/api/getBuildings");
    const data = await response.json();
    setBuildingsList(data.buildingNames);
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!date) {
      alert("Please select a date.");
      return;
    }

    const formattedDate = format(date, "dd/MM/yyyy");

    const response = await fetch("/api/getFreeRooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        buildingName,
        date: formattedDate,
        startTime,
        endTime,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setFreeRooms(data.freeRooms);
    } else {
      const errorData = await response.json();
      alert("Error: " + errorData.error);
    }
  };

  return (
    <div className="bg-slate-700 h-screen flex flex-col items-center p-4">
      <h1 className="text-4xl m-4">Room Availability Checker</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-8">
        <div>
          <label>
            Building Name:
            <select
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              required
              className="ml-2 text-black rounded-sm max-w-64 p-1"
            >
              <option value="">Select a building</option>
              {buildingsList.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Date (DD/MM/YYYY):
            <DatePicker
              selected={date}
              onChange={(date: Date | null) => setDate(date)}
              dateFormat="dd/MM/yyyy"
              locale="fr"
              placeholderText="Select a date"
              className="ml-2 text-black rounded-sm p-1"
              required
            />
          </label>
        </div>
        <div>
          <label>
            Start Time (HH:MM):
            <TimePicker
              onChange={(value) => setStartTime(value ?? "")}
              value={startTime}
              format="HH:mm"
              hourPlaceholder="HH"
              minutePlaceholder="MM"
              disableClock
              // clearIcon={null}
              required
              className="ml-2 text-white rounded-sm p-1"
            />
          </label>
        </div>
        <div>
          <label>
            End Time (HH:MM):
            <TimePicker
              onChange={(value) => setEndTime(value ?? "")}
              value={endTime}
              format="HH:mm"
              hourPlaceholder="HH"
              minutePlaceholder="MM"
              disableClock
              // clearIcon={null}
              required
              className="text-white ml-2 rounded-sm p-1"
            />
          </label>
        </div>
        <div className="flex flex-col items-center my-4">
          <button
            type="submit"
            className="btn-gradient"
          >
            Check Availability
          </button>
        </div>
      </form>

      <h2>Available Rooms:</h2>
      <ul>
        {freeRooms.map(([name, roomId]) => (
          <li key={roomId}>
            Room {name} (ID: {roomId})
          </li>
        ))}
      </ul>
    </div>
  );
}
