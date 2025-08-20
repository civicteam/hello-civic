"use client";

import { useState } from "react";
import { useUser } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";
import WalletSection from "./WalletSection";
import TraitSelector, { SelectedTraits } from "@/components/TraitSelector";
import { createImageAttestation, getExplorerUrl, getAddressExplorerUrl } from "@/lib/civic-attestation";
import type { AttestationResult } from "@/lib/civic-attestation";

interface DashboardContentProps {
  userName: string;
  userEmail: string;
  userId: string;
}

export default function DashboardContent({ userName, userEmail, userId }: DashboardContentProps) {
  const userContext = useUser();
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>({
    personality: "",
    appearance: "",
    background: "",
    special: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [imageHash, setImageHash] = useState("");
  const [attestationResult, setAttestationResult] = useState<AttestationResult | null>(null);
  const [isCreatingAttestation, setIsCreatingAttestation] = useState(false);

  const handleTraitsChange = (traits: SelectedTraits) => {
    setSelectedTraits(traits);
    console.log("Selected traits:", traits);
  };

  const allTraitsSelected = Object.values(selectedTraits).every(trait => trait !== "");

  // Debug logging
  console.log("User context:", userContext.user);
  console.log("Has wallet:", userContext.user ? userHasWallet(userContext) : false);
  console.log("Generated image exists:", !!generatedImage);

  const handleCreateAttestation = async () => {
    if (!generatedImage || !generatedPrompt || !userContext.user) {
      return;
    }

    setIsCreatingAttestation(true);
    try {
      const traitsArray = Object.values(selectedTraits).filter(trait => trait);
      const result = await createImageAttestation(
        userContext,
        generatedImage,
        generatedPrompt,
        traitsArray
      );

      setAttestationResult(result);

      if (result.success) {
        console.log('Attestation created successfully:', result.transactionSignature);
      } else {
        console.error('Failed to create attestation:', result.error);
        alert(`Failed to create attestation: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating attestation:', error);
      alert('Failed to create attestation. Please try again.');
      setAttestationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsCreatingAttestation(false);
    }
  };

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
      setImageHash(data.imageHash || "");
      console.log("Generated prompt:", data.prompt);
      console.log("Generated image:", data.image ? "Image generated successfully" : "No image");
      console.log("Image hash:", data.imageHash);
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

          {imageHash && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Image Hash (SHA-256)</h4>
              <p className="text-gray-600 mb-2 text-sm">
                This hash can be used to verify the image on Solana devnet:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 font-mono break-all">{imageHash}</p>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(imageHash)}
                className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Copy Hash to Clipboard
              </button>
            </div>
          )}

          {generatedImage && userContext.user && userHasWallet(userContext) && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Blockchain Attestation</h4>
              <p className="text-gray-600 mb-4 text-sm">
                Create a permanent, verifiable proof on Solana devnet that you generated this image:
              </p>
              
              {!attestationResult && (
                <button 
                  onClick={handleCreateAttestation}
                  disabled={isCreatingAttestation}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreatingAttestation ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Creating Attestation...
                    </span>
                  ) : (
                    'Create On-Chain Attestation'
                  )}
                </button>
              )}

              {attestationResult && (
                <div className={`p-4 rounded-lg border ${
                  attestationResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  {attestationResult.success ? (
                    <div>
                      <p className="text-green-800 font-medium mb-2">✓ Attestation Created Successfully!</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium">Transaction Signature:</p>
                          <p className="font-mono bg-white p-2 rounded break-all text-xs">
                            {attestationResult.transactionSignature}
                          </p>
                          <a 
                            href={getExplorerUrl(attestationResult.transactionSignature!)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View on Solana Explorer →
                          </a>
                        </div>
                        {attestationResult.attestationPda && (
                          <div className="mt-3">
                            <p className="font-medium">Attestation Account:</p>
                            <p className="font-mono bg-white p-2 rounded break-all text-xs">
                              {attestationResult.attestationPda}
                            </p>
                            <a 
                              href={getAddressExplorerUrl(attestationResult.attestationPda)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              View Account on Explorer →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-800 font-medium mb-2">❌ Attestation Failed</p>
                      <p className="text-red-700 text-sm">{attestationResult.error}</p>
                      <button 
                        onClick={() => setAttestationResult(null)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {generatedImage && userContext.user && !userHasWallet(userContext) && (
            <div className="mb-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium mb-2">⚠ Wallet Required</p>
                <p className="text-yellow-700 text-sm">
                  Create a Solana wallet above to enable blockchain attestation for your generated images.
                </p>
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