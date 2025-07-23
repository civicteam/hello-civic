"use client";

import { useUser } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";
import { useState } from "react";

export default function WalletSection() {
  const userContext = useUser();
  const [isCreating, setIsCreating] = useState(false);

  if (!userContext.user) {
    return <div>Loading user...</div>;
  }

  const handleCreateWallet = async () => {
    if (userHasWallet(userContext)) return;
    
    setIsCreating(true);
    try {
      await userContext.createWallet();
    } catch (error) {
      console.error("Failed to create wallet:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Solana Wallet</h2>
      
      {userHasWallet(userContext) ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium mb-2">✓ Wallet Active</p>
            <div className="space-y-2 text-sm">
              <p><strong>Wallet Address:</strong></p>
              <p className="font-mono bg-gray-100 p-2 rounded break-all">
                {userContext.solana.address}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Your embedded Solana wallet is ready to use. This wallet is non-custodial and securely managed.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium mb-2">⚠ No Wallet Found</p>
            <p className="text-yellow-700 text-sm">
              You don't have a Solana wallet yet. Create an embedded wallet to get started with Web3 features.
            </p>
          </div>
          
          <button
            onClick={handleCreateWallet}
            disabled={isCreating || userContext.walletCreationInProgress}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating || userContext.walletCreationInProgress ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating Wallet...
              </span>
            ) : (
              "Create Solana Wallet"
            )}
          </button>
          
          <div className="text-sm text-gray-600">
            <p>This will create a non-custodial embedded wallet for you. Neither Civic nor this app will have access to your private keys.</p>
          </div>
        </div>
      )}
    </div>
  );
}