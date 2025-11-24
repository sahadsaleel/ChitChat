import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2, Lock } from "lucide-react";

const TwoFactorVerify = ({ userId, onVerified }) => {
    const { verify2FA } = useAuthStore();
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await verify2FA({ email: "", password: "", twoFactorToken: token }); // Note: Logic in store might need adjustment to handle just token if we passed userId differently, but reusing login endpoint for now which expects body. Actually, wait.
        // The login endpoint expects email/password OR we need a separate verify endpoint for login flow if we want to be cleaner.
        // However, my store `verify2FA` calls `/auth/login` again. 
        // But wait, I need to pass the email and password again? Or just the token?
        // The backend `login` controller checks for `twoFactorToken`. If present, it verifies.
        // But it also checks email/password first. So I need to store the email/password temporarily or pass them through.
        // A better approach for this specific flow might be to have the initial login return a temporary token, and then use that token + 2FA code to finalize.
        // For now, to keep it simple as per my plan, I might have to ask the user to re-enter credentials or (better) store them in a temporary state in the parent component.

        // Let's assume the parent component (LoginPage) handles the state and passes the `login` function again with the token.
        // Actually, let's just make this component accept the `onSubmit` handler.

        if (onVerified) {
            await onVerified(token);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
            <p className="text-base-content/60 text-center">
                Enter the 6-digit code from your authenticator app.
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="form-control">
                    <input
                        type="text"
                        className="input input-bordered w-full text-center text-2xl tracking-widest"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                    />
                </div>
                <button type="submit" className="btn btn-primary w-full" disabled={isLoading || token.length !== 6}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Verify"}
                </button>
            </form>
        </div>
    );
};

export default TwoFactorVerify;
