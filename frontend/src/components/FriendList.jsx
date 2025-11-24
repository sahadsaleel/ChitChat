import { useEffect, useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useChatStore } from "../store/useChatStore";
import { UserPlus, UserMinus, Ban, Check, X } from "lucide-react";

const FriendList = () => {
    const { friends, friendRequests, getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, blockUser } = useFriendStore();
    const { setSelectedUser } = useChatStore();
    const [addFriendId, setAddFriendId] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        getFriends();
        getFriendRequests();
    }, [getFriends, getFriendRequests]);

    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (addFriendId.trim()) {
            await sendFriendRequest(addFriendId);
            setAddFriendId("");
            setShowAddModal(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-base-300 flex justify-between items-center">
                <h3 className="font-semibold">Friends</h3>
                <button onClick={() => setShowAddModal(true)} className="btn btn-sm btn-ghost">
                    <UserPlus className="size-5" />
                </button>
            </div>

            <div className="overflow-y-auto flex-1 py-2">
                {/* Friend Requests Section */}
                {friendRequests.length > 0 && (
                    <div className="mb-6">
                        <h4 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Friend Requests ({friendRequests.length})
                        </h4>
                        {friendRequests.map((request) => (
                            <div
                                key={request._id}
                                className="w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors"
                            >
                                <div className="relative">
                                    <img
                                        src={request.senderId.profilePic || "/avatar.png"}
                                        alt={request.senderId.fullName}
                                        className="size-10 object-cover rounded-full"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{request.senderId.fullName}</div>
                                    <div className="text-xs text-zinc-400">ID: {request.senderId.shortId}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => acceptFriendRequest(request.senderId._id)}
                                        className="btn btn-sm bg-[#256494] hover:bg-[#1b496d] text-white border-none"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => rejectFriendRequest(request.senderId._id)}
                                        className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="divider my-2"></div>
                    </div>
                )}

                {/* Friends List Section */}
                <h4 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    All Friends ({friends.length})
                </h4>
                {friends.length === 0 ? (
                    <div className="text-center text-zinc-500 py-4">No friends yet</div>
                ) : (
                    friends.map((friend) => (
                        <div
                            key={friend._id}
                            className="w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors cursor-pointer group"
                            onClick={() => setSelectedUser(friend)}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                <img
                                    src={friend.profilePic || "/avatar.png"}
                                    alt={friend.fullName}
                                    className="size-12 object-cover rounded-full"
                                />
                            </div>
                            <div className="hidden lg:block text-left min-w-0 flex-1">
                                <div className="font-medium truncate">{friend.fullName}</div>
                                <div className="text-sm text-zinc-400">
                                    {friend.online ? "Online" : "Offline"}
                                </div>
                            </div>
                            <div className="hidden group-hover:flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); blockUser(friend._id); }} className="btn btn-xs btn-error btn-circle" title="Block">
                                    <Ban size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Friend Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-80 shadow-2xl border border-blue-100">
                        <h3 className="font-bold text-lg mb-4 text-[#256494]">Add Friend</h3>
                        <form onSubmit={handleAddFriend}>
                            <div className="form-control w-full mb-4">
                                <label className="label">
                                    <span className="label-text text-gray-700 font-medium">User ID</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter User ID"
                                    className="input input-bordered w-full focus:outline-none focus:border-[#256494] focus:ring-1 focus:ring-[#256494]"
                                    value={addFriendId}
                                    onChange={(e) => setAddFriendId(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-ghost text-gray-500 hover:bg-gray-100">Cancel</button>
                                <button type="submit" className="btn bg-[#256494] hover:bg-[#1a4d6d] text-white border-none">Send Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendList;
