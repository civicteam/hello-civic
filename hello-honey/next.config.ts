import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "29da3b0e-c986-4966-8519-9234cf039974"
});

export default withCivicAuth(nextConfig);
