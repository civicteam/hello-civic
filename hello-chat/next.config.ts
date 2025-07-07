import { createCivicAuthPlugin } from "@civic/auth/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "c209d3e9-708f-4604-be72-63e7d1acb5b4"
});

export default withCivicAuth(nextConfig)