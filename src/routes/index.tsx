import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [symbol, setSymbol] = useState("");

  const handleClick = async () => {
    if (!symbol) {
      return;
    }

    console.log(await invoke("info", { symbol }));
  };

  return (
    <div className="p-2 space-y-2">
      <div>
        <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
          Symbol
        </label>
        <input
          id="symbol"
          type="text"
          value={symbol}
          onChange={(event) => setSymbol(event.currentTarget.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter symbol"
        />
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Fetch Info
      </button>
    </div>
  );
}
