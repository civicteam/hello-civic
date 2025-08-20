"use client";

import { useState } from "react";

interface TraitSelectorProps {
  onTraitsChange: (traits: SelectedTraits) => void;
}

export interface SelectedTraits {
  personality: string;
  appearance: string;
  background: string;
  special: string;
}

const traitOptions = {
  personality: [
    "Adventurous",
    "Mysterious",
    "Friendly",
    "Wise",
    "Mischievous",
    "Brave",
    "Curious",
    "Loyal",
    "Creative",
    "Determined"
  ],
  appearance: [
    "Ethereal",
    "Robotic",
    "Natural",
    "Cosmic",
    "Crystalline",
    "Shadow",
    "Luminous",
    "Mechanical",
    "Organic",
    "Elemental"
  ],
  background: [
    "Desert Wanderer",
    "Space Explorer",
    "Forest Guardian",
    "City Dweller",
    "Ocean Voyager",
    "Mountain Sage",
    "Time Traveler",
    "Dream Walker",
    "Sky Pirate",
    "Underground Rebel"
  ],
  special: [
    "Telepathic",
    "Shape-shifter",
    "Energy Manipulator",
    "Time Bender",
    "Elemental Master",
    "Tech Genius",
    "Nature Speaker",
    "Mind Reader",
    "Dimension Hopper",
    "Light Weaver"
  ]
};

export default function TraitSelector({ onTraitsChange }: TraitSelectorProps) {
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>({
    personality: "",
    appearance: "",
    background: "",
    special: ""
  });

  const handleTraitChange = (category: keyof SelectedTraits, value: string) => {
    const newTraits = { ...selectedTraits, [category]: value };
    setSelectedTraits(newTraits);
    onTraitsChange(newTraits);
  };

  const allTraitsSelected = Object.values(selectedTraits).every(trait => trait !== "");

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Character Traits</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personality Trait */}
        <div>
          <label htmlFor="personality" className="block text-sm font-medium text-gray-700 mb-2">
            Personality
          </label>
          <select
            id="personality"
            value={selectedTraits.personality}
            onChange={(e) => handleTraitChange("personality", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select personality...</option>
            {traitOptions.personality.map(trait => (
              <option key={trait} value={trait}>{trait}</option>
            ))}
          </select>
        </div>

        {/* Appearance Trait */}
        <div>
          <label htmlFor="appearance" className="block text-sm font-medium text-gray-700 mb-2">
            Appearance
          </label>
          <select
            id="appearance"
            value={selectedTraits.appearance}
            onChange={(e) => handleTraitChange("appearance", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select appearance...</option>
            {traitOptions.appearance.map(trait => (
              <option key={trait} value={trait}>{trait}</option>
            ))}
          </select>
        </div>

        {/* Background Trait */}
        <div>
          <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-2">
            Background
          </label>
          <select
            id="background"
            value={selectedTraits.background}
            onChange={(e) => handleTraitChange("background", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select background...</option>
            {traitOptions.background.map(trait => (
              <option key={trait} value={trait}>{trait}</option>
            ))}
          </select>
        </div>

        {/* Special Ability Trait */}
        <div>
          <label htmlFor="special" className="block text-sm font-medium text-gray-700 mb-2">
            Special Ability
          </label>
          <select
            id="special"
            value={selectedTraits.special}
            onChange={(e) => handleTraitChange("special", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select special ability...</option>
            {traitOptions.special.map(trait => (
              <option key={trait} value={trait}>{trait}</option>
            ))}
          </select>
        </div>
      </div>

      {allTraitsSelected && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            ✓ All traits selected! Ready to generate your character.
          </p>
        </div>
      )}
    </div>
  );
}