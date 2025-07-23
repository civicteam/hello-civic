import { getUser } from "@civic/auth-web3/nextjs";
import { UserButton } from "@civic/auth-web3/react";
import DashboardContent from "./DashboardContent";

export default async function Dashboard() {
  const user = await getUser();

  if (!user) return <div>User not logged in</div>

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI Character Generator</h1>
          <UserButton />
        </div>
        
        <DashboardContent 
          userName={user.name || "User"}
          userEmail={user.email || ""}
          userId={user.id}
        />
      </div>
    </div>
  );
}