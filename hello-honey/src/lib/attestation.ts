import {
  getCreateCredentialInstruction,
  getCreateSchemaInstruction,
  serializeAttestationData,
  getCreateAttestationInstruction,
  fetchSchema,
  deriveAttestationPda,
  deriveCredentialPda,
  deriveSchemaPda,
} from "sas-lib";
import {
  createSolanaClient,
  SolanaClient,
  Address,
} from "gill";
import { createHash } from 'crypto';

const CONFIG = {
  CLUSTER_OR_RPC: 'devnet',
  CREDENTIAL_NAME: 'HELLO-HONEY-IMAGES',
  SCHEMA_NAME: 'IMAGE-GENERATION-PROOF',
  SCHEMA_LAYOUT: Buffer.from([32, 32, 8, 12]), // image_hash (32), prompt_hash (32), timestamp (8), traits (12)
  SCHEMA_FIELDS: ["image_hash", "prompt_hash", "timestamp", "traits"],
  SCHEMA_VERSION: 1,
  SCHEMA_DESCRIPTION: 'Proof that an image was generated using a specific prompt and traits',
  ATTESTATION_EXPIRY_DAYS: 365 * 10 // 10 years
};

export interface ImageAttestationData {
  image_hash: string;
  prompt_hash: string;
  timestamp: number;
  traits: string;
}

let client: SolanaClient | null = null;

// Initialize the attestation service
export async function initializeAttestationService(): Promise<SolanaClient> {
  if (!client) {
    client = createSolanaClient({ urlOrMoniker: CONFIG.CLUSTER_OR_RPC });
  }
  return client;
}

// Get or create credential PDA for a user's wallet
export async function getCredentialPda(userWalletAddress: string): Promise<Address> {
  const [credentialPda] = await deriveCredentialPda({
    authority: userWalletAddress as Address,
    name: CONFIG.CREDENTIAL_NAME
  });
  return credentialPda;
}

// Get or create schema PDA
export async function getSchemaPda(credentialPda: Address): Promise<Address> {
  const [schemaPda] = await deriveSchemaPda({
    credential: credentialPda,
    name: CONFIG.SCHEMA_NAME,
    version: CONFIG.SCHEMA_VERSION
  });
  return schemaPda;
}

// Generate image hash from base64 image
export function generateImageHash(imageBase64: string): string {
  return createHash('sha256').update(imageBase64).digest('hex');
}

// Generate prompt hash
export function generatePromptHash(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex');
}

// Prepare attestation data for an image
export function prepareAttestationData(
  imageBase64: string,
  prompt: string,
  traits: string[]
): ImageAttestationData {
  return {
    image_hash: generateImageHash(imageBase64),
    prompt_hash: generatePromptHash(prompt),
    timestamp: Math.floor(Date.now() / 1000),
    traits: traits.join(',')
  };
}

// Get attestation PDA for an image
export async function getAttestationPda(
  credentialPda: Address,
  schemaPda: Address,
  imageHash: string
): Promise<Address> {
  const nonce = imageHash.slice(0, 32);
  const [attestationPda] = await deriveAttestationPda({
    credential: credentialPda,
    schema: schemaPda,
    nonce: nonce as Address
  });
  return attestationPda;
}

// Check if attestation infrastructure exists for a user
export async function checkAttestationInfrastructure(userWalletAddress: string): Promise<{
  credentialExists: boolean;
  schemaExists: boolean;
  credentialPda: Address;
  schemaPda: Address;
}> {
  const client = await initializeAttestationService();
  const credentialPda = await getCredentialPda(userWalletAddress);
  const schemaPda = await getSchemaPda(credentialPda);

  let credentialExists = false;
  let schemaExists = false;

  try {
    // Check if credential exists
    await client.rpc.getAccountInfo(credentialPda).send();
    credentialExists = true;
  } catch (error) {
    // Credential doesn't exist
  }

  try {
    // Check if schema exists
    await fetchSchema(client.rpc, schemaPda);
    schemaExists = true;
  } catch (error) {
    // Schema doesn't exist
  }

  return {
    credentialExists,
    schemaExists,
    credentialPda,
    schemaPda
  };
}

// Prepare instructions for setting up attestation infrastructure
export async function prepareSetupInstructions(userWalletAddress: string): Promise<{
  credentialInstruction?: any;
  schemaInstruction?: any;
  credentialPda: Address;
  schemaPda: Address;
}> {
  const { credentialExists, schemaExists, credentialPda, schemaPda } = 
    await checkAttestationInfrastructure(userWalletAddress);

  let credentialInstruction = undefined;
  let schemaInstruction = undefined;

  if (!credentialExists) {
    credentialInstruction = getCreateCredentialInstruction({
      payer: { address: userWalletAddress as Address },
      credential: credentialPda,
      authority: { address: userWalletAddress as Address },
      name: CONFIG.CREDENTIAL_NAME,
      signers: [userWalletAddress as Address]
    });
  }

  if (!schemaExists) {
    schemaInstruction = getCreateSchemaInstruction({
      authority: { address: userWalletAddress as Address },
      payer: { address: userWalletAddress as Address },
      name: CONFIG.SCHEMA_NAME,
      credential: credentialPda,
      description: CONFIG.SCHEMA_DESCRIPTION,
      fieldNames: CONFIG.SCHEMA_FIELDS,
      schema: schemaPda,
      layout: CONFIG.SCHEMA_LAYOUT,
    });
  }

  return {
    credentialInstruction,
    schemaInstruction,
    credentialPda,
    schemaPda
  };
}

// Prepare attestation instruction for an image
export async function prepareAttestationInstruction(
  userWalletAddress: string,
  imageBase64: string,
  prompt: string,
  traits: string[]
): Promise<{
  instruction: any;
  attestationPda: Address;
  attestationData: ImageAttestationData;
}> {
  const client = await initializeAttestationService();
  const credentialPda = await getCredentialPda(userWalletAddress);
  const schemaPda = await getSchemaPda(credentialPda);
  
  const attestationData = prepareAttestationData(imageBase64, prompt, traits);
  const imageHash = attestationData.image_hash;
  
  const attestationPda = await getAttestationPda(credentialPda, schemaPda, imageHash);
  
  const schema = await fetchSchema(client.rpc, schemaPda);
  const expiryTimestamp = Math.floor(Date.now() / 1000) + (CONFIG.ATTESTATION_EXPIRY_DAYS * 24 * 60 * 60);
  
  const nonce = imageHash.slice(0, 32);
  
  const instruction = await getCreateAttestationInstruction({
    payer: { address: userWalletAddress as Address },
    authority: { address: userWalletAddress as Address },
    credential: credentialPda,
    schema: schemaPda,
    attestation: attestationPda,
    nonce: nonce as Address,
    expiry: expiryTimestamp,
    data: serializeAttestationData(schema.data, attestationData),
  });

  return {
    instruction,
    attestationPda,
    attestationData
  };
}