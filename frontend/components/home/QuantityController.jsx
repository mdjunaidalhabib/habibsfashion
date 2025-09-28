"use client";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function QuantityController({ qty, stock, onChange, allowZero = false }) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
      <button
        onClick={() => onChange(-1)}
        disabled={!allowZero && qty <= 1}
        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
      >
        <FaMinus className="w-4 h-4" />
      </button>

      <span className="font-bold min-w-[24px] text-center">{qty}</span>

      <button
        onClick={() => onChange(+1)}
        disabled={stock && qty >= stock}
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        <FaPlus className="w-4 h-4" />
      </button>
    </div>
  );
}
