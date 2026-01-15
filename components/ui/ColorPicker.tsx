"use client";

import React, { useState } from "react";
import { Button } from "./button";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#10B981" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Gray", value: "#6B7280" },
  { name: "Slate", value: "#64748B" },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = "Primary Color",
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      
      <div className="flex items-center gap-3">
        {/* Color Preview */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="w-16 h-16 rounded-lg border-2 border-neutral-300 shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: value }}
            aria-label="Color preview"
          />
          {showPicker && (
            <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-xl border border-neutral-200">
              {/* Preset Colors */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      onChange(color.value);
                      setShowPicker(false);
                    }}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      value === color.value
                        ? "border-neutral-900 scale-110"
                        : "border-neutral-300 hover:border-neutral-500"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              
              {/* Custom Color Input */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full h-10 rounded border border-neutral-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                      onChange(e.target.value);
                    }
                  }}
                  className="w-24 px-2 py-1 text-sm border border-neutral-300 rounded"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Color Value Display */}
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                onChange(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="#3B82F6"
          />
        </div>
      </div>
      
      {/* Click outside to close */}
      {showPicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};
