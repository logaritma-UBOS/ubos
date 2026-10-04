const fs = require('fs');

let pageCode = fs.readFileSync('src/app/login/page.tsx', 'utf8');

const importStr = `import { useActionState, useState } from "react"`;
const newImportStr = `import { useActionState, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"`;

pageCode = pageCode.replace(importStr, newImportStr);

const stateDef = `const [state, action, pending] = useActionState(loginUser, null)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)`;

const newStateDef = `const [state, action, pending] = useActionState(loginUser, null)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  
  const searchParams = useSearchParams()
  const errorParam = searchParams?.get("error")
  const [clientError, setClientError] = useState<string | null>(null)
  
  useEffect(() => {
    if (errorParam === "OAuthAccountNotLinked") {
      setClientError("Email ini sudah terdaftar menggunakan metode login lain. Silakan gunakan password.");
    } else if (errorParam) {
      setClientError("Google Login dibatalkan atau terjadi kesalahan (" + errorParam + ")");
    }
  }, [errorParam])`;

pageCode = pageCode.replace(stateDef, newStateDef);

const errorDisplay = `{/* Error */}
            {state?.error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium">
                {state.error}
              </div>
            )}`;

const newErrorDisplay = `{/* Error */}
            {(state?.error || clientError) && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium mb-4">
                {state?.error || clientError}
              </div>
            )}`;

pageCode = pageCode.replace(errorDisplay, newErrorDisplay);

fs.writeFileSync('src/app/login/page.tsx', pageCode);
console.log("Updated login page");
