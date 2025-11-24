import { useState, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useFriendStore } from "../store/useFriendStore";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";

const CreateGroupModal = ({ onClose }) => {
    const { createGroup } = useGroupStore();
    const { friends, getFriends } = useFriendStore();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [step, setStep] = useState(1); // 1: Select Members, 2: Group Details

    useEffect(() => {
        getFriends();
    }, [getFriends]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const success = await createGroup({
            name,
            description,
            members: selectedMembers,
        });

        if (success) {
            onClose();
        }
    };

    const toggleMember = (friendId) => {
        if (selectedMembers.includes(friendId)) {
            setSelectedMembers(selectedMembers.filter((id) => id !== friendId));
        } else {
            setSelectedMembers([...selectedMembers, friendId]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-96 max-h-[80vh] overflow-y-auto shadow-2xl border border-blue-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-primary">
                        {step === 1 ? "Select Members" : "Group Details"}
                    </h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle text-zinc-500 hover:text-zinc-800">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                                {friends.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-500">
                                        <p>No friends found.</p>
                                        <p className="text-xs mt-1">Add friends to create a group.</p>
                                    </div>
                                ) : (
                                    friends.map((friend) => (
                                        <label
                                            key={friend._id}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedMembers.includes(friend._id)
                                                ? "bg-primary/10 border-primary/50"
                                                : "hover:bg-base-200 border-transparent"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary checkbox-sm"
                                                checked={selectedMembers.includes(friend._id)}
                                                onChange={() => toggleMember(friend._id)}
                                            />
                                            <img
                                                src={friend.profilePic || "/avatar.png"}
                                                alt={friend.fullName}
                                                className="size-10 rounded-full object-cover"
                                            />
                                            <span className="font-medium">{friend.fullName}</span>
                                        </label>
                                    ))
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={selectedMembers.length === 0}
                                    className="btn btn-primary w-full"
                                >
                                    Next <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Group Name</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Weekend Trip"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Description</span>
                                    <span className="label-text-alt text-zinc-400">Optional</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What's this group about?"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn btn-ghost flex-1"
                                >
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button type="submit" className="btn btn-primary flex-1">
                                    Create Group <Check size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
