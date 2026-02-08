"use client";

import { useState } from "react";

interface RoleFormProps {
  action: (formData: FormData) => Promise<void>; // Ensure this matches your server action signature
  userId: string;
  roleValue?: string;
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
  cssClass = "btn btn-primary", // Default bootstrap class
}: RoleFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  // If we are in "Confirmation Mode", show the danger state
  if (isConfirming) {
    return (
      <div className="d-flex align-items-center gap-2">
        <form action={action}>
          <input type="hidden" value={userId} name="id" />
          {roleValue && <input type="hidden" value={roleValue} name="role" />}
          
          <button
            type="submit"
            className="btn btn-danger btn-sm"
            onClick={() => setIsConfirming(false)} 
          >
            {confirmLabel}
          </button>
        </form>
        
        <button
          onClick={() => setIsConfirming(false)}
          className="btn btn-secondary btn-sm"
          type="button"
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
      type="button"
    >
      {buttonLabel}
    </button>
  );
}