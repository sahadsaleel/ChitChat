import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  
  return (
    <div className="h-screen bg-gradient-to-br from-[#2c5f7f] to-[#1e3a52]">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
