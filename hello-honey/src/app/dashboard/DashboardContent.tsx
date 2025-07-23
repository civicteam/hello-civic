"use client";

import { useState } from "react";
import WalletSection from "./WalletSection";
import TraitSelector, { SelectedTraits } from "@/components/TraitSelector";

interface DashboardContentProps {
  userName: string;
  userEmail: string;
  userId: string;
}

export default function DashboardContent({ userName, userEmail, userId }: DashboardContentProps) {
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>({
    personality: "",
    appearance: "",
    background: "",
    special: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");

  const handleTraitsChange = (traits: SelectedTraits) => {
    setSelectedTraits(traits);
    console.log("Selected traits:", traits);
  };

  const allTraitsSelected = Object.values(selectedTraits).every(trait => trait !== "");

  const handleGenerateCharacter = async () => {
    setIsGenerating(true);
    try {
      const traitsArray = Object.values(selectedTraits).filter(trait => trait);
      
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ traits: traitsArray }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt);
      setGeneratedImage(data.image);
      console.log("Generated prompt:", data.prompt);
      console.log("Generated image:", data.image ? "Image generated successfully" : "No image");
    } catch (error) {
      console.error('Error generating character:', error);
      alert('Failed to generate character. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {userName}!</h2>
        <p className="text-gray-600 mb-4">
          Create your unique AI character by selecting traits below.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p><strong>User ID:</strong> {userId}</p>
          <p><strong>Email:</strong> {userEmail}</p>
          <p><strong>Name:</strong> {userName}</p>
        </div>
      </div>

      <WalletSection />
      
      <TraitSelector onTraitsChange={handleTraitsChange} />

      {allTraitsSelected && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Ready to Generate</h3>
          <p className="text-gray-600 mb-4">
            Your character will have these traits:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm mb-6">
            <div><strong>Personality:</strong> {selectedTraits.personality}</div>
            <div><strong>Appearance:</strong> {selectedTraits.appearance}</div>
            <div><strong>Background:</strong> {selectedTraits.background}</div>
            <div><strong>Special:</strong> {selectedTraits.special}</div>
          </div>
          <button 
            onClick={handleGenerateCharacter}
            disabled={isGenerating}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Character'}
          </button>
        </div>
      )}

      {(generatedPrompt || generatedImage) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Your Generated Character</h3>
          
          {generatedImage && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Character Image</h4>
              <div className="flex justify-center">
                <img 
                  src={`data:image/png;base64,${generatedImage}`}
                  alt="Generated Hello Honey character"
                  className="max-w-md rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}
          
          {generatedPrompt && (
            <div>
              <h4 className="font-medium mb-2">Image Generation Prompt</h4>
              <p className="text-gray-600 mb-4">
                The prompt used to create this character:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{generatedPrompt}</p>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                className="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Copy Prompt to Clipboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}