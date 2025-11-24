import { useEffect, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { Users, Plus } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const GroupList = () => {
    const { groups, getGroups, setSelectedGroup } = useGroupStore();
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        getGroups();
    }, [getGroups]);

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-base-300 flex justify-between items-center">
                <h3 className="font-semibold">Groups</h3>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-sm btn-ghost">
                    <Plus className="size-5" />
                </button>
            </div>

            <div className="overflow-y-auto flex-1 py-2">
                {groups.length === 0 ? (
                    <div className="text-center text-zinc-500 py-4">No groups yet</div>
                ) : (
                    groups.map((group) => (
                        <div
                            key={group._id}
                            className="w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors cursor-pointer"
                            onClick={() => setSelectedGroup(group)}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="size-6 text-primary" />
                                </div>
                            </div>
                            <div className="hidden lg:block text-left min-w-0">
                                <div className="font-medium truncate">{group.name}</div>
                                <div className="text-sm text-zinc-400">
                                    {group.members.length} members
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <CreateGroupModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
};

export default GroupList;
