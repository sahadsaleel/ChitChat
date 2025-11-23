import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatIST } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    isMessagesLoading,
    selectedUser,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const endRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null); // NEW STATE

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex justify-center items-center text-gray-500">
        Select a user to start chatting
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a]">
      <ChatHeader />

      {/* 🔥 Image Preview Popup */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[90%] max-h-[90%] rounded-xl shadow-lg"
          />
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: "#1e3a52",
        }}
      >
        {messages.map((msg) => {
          const isSender = msg.senderId === authUser._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}
            >
              <div
                className={`flex items-end gap-2 max-w-[70%] ${
                  isSender ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700">
                    <img
                      src={
                        isSender
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div
                    className={`rounded-lg px-3 py-2 shadow-md ${
                      isSender
                        ? "bg-[#27364a] text-white rounded-bl-none"
                        : "bg-[#203c97] text-white rounded-br-none"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        className="max-w-[250px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition"
                        alt="message attachment"
                        onClick={() => setPreviewImage(msg.image)} // OPEN POPUP
                      />
                    )}

                    {msg.text && <p className="text-sm break-words">{msg.text}</p>}

                    {/* Timestamp */}
                    <div
                      className={`text-[10px] mt-1 ${
                        isSender ? "text-gray-300" : "text-gray-400"
                      } text-right`}
                    >
                      {formatIST(msg.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={endRef}></div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
