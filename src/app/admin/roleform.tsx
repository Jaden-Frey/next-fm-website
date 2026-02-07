"use client";

import { useState } from "react";

interface RoleFormProps {
  action: (formData: FormData) => Promise<void>;
  userId: string;
  roleValue?: string; // Optional, because 'Remove Role' doesn't need a role value
  buttonLabel: string;
  confirmLabel?: string;
  cssClass?: string;
}

export function ProtectedRoleButton({
  action,
  userId,
  roleValue,
  buttonLabel,
  confirmLabel = "Confirm?",
  cssClass,
}: RoleFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  // If we are in "Confirmation Mode", show the danger state
  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        <form action={action}>
          <input type="hidden" value={userId} name="id" />
          {roleValue && <input type="hidden" value={roleValue} name="role" />}
          
          <button
            type="submit"
            className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={() => setIsConfirming(false)} // Reset after submit (optional)
          >
            {confirmLabel}
          </button>
        </form>
        
        <button
          onClick={() => setIsConfirming(false)}
          className="px-2 py-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Default State: Normal Button
  return (
    <button
      onClick={() => setIsConfirming(true)}
      className={cssClass}
    >
      {buttonLabel}
    </button>
  );
}