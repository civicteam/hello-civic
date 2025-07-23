import { getUser } from "@civic/auth-web3/nextjs";
import { UserButton } from "@civic/auth-web3/react";
import WalletSection from "./WalletSection";

export default async function Dashboard() {
  const user = await getUser();

  if (!user) return <div>User not logged in</div>

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <UserButton />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.name}!</h2>
          <p className="text-gray-600 mb-4">
            This is a protected dashboard page. You can only access this page when authenticated.
          </p>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name}</p>
          </div>
        </div>

        <WalletSection />
      </div>
    </div>
  );
}