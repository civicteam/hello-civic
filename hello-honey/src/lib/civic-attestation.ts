"use client";

import { userHasWallet } from "@civic/auth-web3";
import type { UserContext } from "@civic/auth-web3/react";
import { Connection, Transaction, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { 
  prepareSetupInstructions, 
  prepareAttestationInstruction,
  initializeAttestationService
} from './attestation';

export interface AttestationResult {
  success: boolean;
  transactionSignature?: string;
  error?: string;
  attestationPda?: string;
}

// Convert sas-lib instruction to web3.js TransactionInstruction
function convertSasToWeb3Instruction(sasInstruction: any): TransactionInstruction {
  console.log("Converting SAS instruction:", sasInstruction);
  
  const accounts = sasInstruction.accounts || [];
  const programId = sasInstruction.programAddress;
  const data = sasInstruction.data || Buffer.alloc(0);
  
  return new TransactionInstruction({
    keys: accounts.map((account: any) => ({
      pubkey: new PublicKey(account.address),
      isSigner: account.role === 1, // role 1 seems to be signer
      isWritable: true, // assuming all accounts are writable for SAS operations
    })),
    programId: new PublicKey(programId),
    data: Buffer.from(data),
  });
}

export async function createImageAttestation(
  userContext: UserContext,
  imageBase64: string,
  prompt: string,
  traits: string[]
): Promise<AttestationResult> {
  try {
    // Check if user has wallet
    if (!userHasWallet(userContext)) {
      return {
        success: false,
        error: "No wallet connected. Please create a wallet first."
      };
    }

    const walletAddress = userContext.solana.address;
    console.log("Creating attestation for wallet:", walletAddress);

    // Create connection to Solana devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Get wallet methods
    const wallet = userContext.solana.wallet;
    console.log("Wallet object:", wallet);

    // Initialize the Solana client
    await initializeAttestationService();

    // Check and prepare setup instructions if needed
    const setupResult = await prepareSetupInstructions(walletAddress);
    
    // If we need to setup infrastructure, do it first
    if (setupResult.credentialInstruction || setupResult.schemaInstruction) {
      console.log("Setting up attestation infrastructure...");
      
      try {
        const setupTransaction = new Transaction();
        
        if (setupResult.credentialInstruction) {
          const web3Instruction = convertSasToWeb3Instruction(setupResult.credentialInstruction);
          setupTransaction.add(web3Instruction);
        }
        if (setupResult.schemaInstruction) {
          const web3Instruction = convertSasToWeb3Instruction(setupResult.schemaInstruction);
          setupTransaction.add(web3Instruction);
        }

        const setupTxSignature = await wallet.sendTransaction(setupTransaction, connection);
        console.log("Setup transaction signature:", setupTxSignature);
        
        // Wait for confirmation
        await connection.confirmTransaction(setupTxSignature, 'confirmed');
      } catch (error) {
        console.error("Failed to setup attestation infrastructure:", error);
        return {
          success: false,
          error: "Failed to setup attestation infrastructure. Please try again."
        };
      }
    }

    // Prepare the attestation instruction
    const attestationResult = await prepareAttestationInstruction(
      walletAddress,
      imageBase64,
      prompt,
      traits
    );

    console.log("Creating attestation with PDA:", attestationResult.attestationPda);

    // Create and send the attestation transaction
    const web3AttestationInstruction = convertSasToWeb3Instruction(attestationResult.instruction);
    const attestationTransaction = new Transaction().add(web3AttestationInstruction);
    const transactionSignature = await wallet.sendTransaction(attestationTransaction, connection);

    console.log("Attestation created! Transaction signature:", transactionSignature);

    // Wait for confirmation
    await connection.confirmTransaction(transactionSignature, 'confirmed');

    return {
      success: true,
      transactionSignature,
      attestationPda: attestationResult.attestationPda
    };

  } catch (error) {
    console.error("Error creating attestation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export function getExplorerUrl(signature: string, network: string = 'devnet'): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${network}`;
}

export function getAddressExplorerUrl(address: string, network: string = 'devnet'): string {
  return `https://explorer.solana.com/address/${address}?cluster=${network}`;
}