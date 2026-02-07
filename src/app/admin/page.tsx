import { clerkClient } from "@clerk/nextjs/server";
import { removeRole, setRole } from "./actions"; 
import { ProtectedRoleButton } from "./roleform"; 

export default async function Admin() {
  const client = await clerkClient();
  const users = (await client.users.getUserList()).data;

  return (
    <>
      {users.map((user) => {
        return (
          <div
            key={user.id}
            className={`flex items-center justify-between gap-4 p-4 ${
              users.indexOf(user) % 2 === 0
                ? "bg-neutral-50 dark:bg-neutral-800"
                : "bg-white dark:bg-neutral-900"
            }`}
          >
            <div className="flex gap-8">
              {/* User Info (Same as before) */}
              <div className="dark:text-neutral-200">
                {user.firstName} {user.lastName}
              </div>
              <div className="dark:text-neutral-200">
                {user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress}
              </div>
              <div className="dark:text-neutral-200">
                {user.publicMetadata.role as string}
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="flex gap-2">
              
              {/* SAFE Make Admin Button */}
              <ProtectedRoleButton 
                action={setRole}
                userId={user.id}
                roleValue="admin"
                buttonLabel="Make Admin"
                confirmLabel="Confirm Admin?"
                cssClass="px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 dark:text-neutral-200 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
              />

              {/* SAFE Remove Role Button */}
              <ProtectedRoleButton 
                action={removeRole}
                userId={user.id}
                buttonLabel="Remove Role"
                confirmLabel="Confirm Removal?"
                cssClass="px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 dark:text-neutral-200 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
              />

            </div>
          </div>
        );
      })}
    </>
  );
}