import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2 } from "lucide-react";

const TwoFactorSetup = () => {
    const { enable2FA, confirm2FA, disable2FA, authUser } = useAuthStore();
    const [qrCode, setQrCode] = useState(null);
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleEnable = async () => {
        setIsLoading(true);
        try {
            const data = await enable2FA();
            setQrCode(data.qrCode);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            const success = await confirm2FA(token);
            if (success) {
                setQrCode(null);
                setToken("");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable = async () => {
        if (confirm("Are you sure you want to disable 2FA?")) {
            await disable2FA();
        }
    }

    return (
        <div className="p-6 bg-base-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>

            {authUser.is2FAEnabled ? (
                <div>
                    <p className="text-green-500 mb-4">2FA is currently enabled.</p>
                    <button onClick={handleDisable} className="btn btn-error">Disable 2FA</button>
                </div>
            ) : (
                <div>
                    {!qrCode ? (
                        <button onClick={handleEnable} className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Enable 2FA"}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p>Scan this QR code with your authenticator app:</p>
                            <img src={qrCode} alt="2FA QR Code" className="mx-auto border-4 border-white" />
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Enter Code</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="123456"
                                />
                            </div>
                            <button onClick={handleVerify} className="btn btn-success w-full" disabled={isLoading || token.length !== 6}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Enable"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TwoFactorSetup;
