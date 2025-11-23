import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Calendar, Info, ChevronRight, X } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  const [previewImg, setPreviewImg] = useState(null);

  // About Edit
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(authUser?.about || "");

  // Handle profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewImg(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profilePic", file);

    await updateProfile(formData);
  };

  // Handle about update
  const handleAboutUpdate = async () => {
    const formData = new FormData();
    formData.append("about", aboutText);

    await updateProfile(formData);
    setIsEditingAbout(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2942] via-[#1a4d6d] to-[#256494]">

      {/* Header */}
      <div className="bg-[#0d1b2a] bg-opacity-40 backdrop-blur-sm py-2 px-4 sm:px-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Profile Picture */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 mb-4 sm:mb-6 border border-white border-opacity-20">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>

              <img
                src={previewImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl"
              />

              <label
                htmlFor="avatar-upload"
                className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 p-2.5 sm:p-3 rounded-full cursor-pointer transition-all shadow-lg transform hover:scale-110"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#256494] mt-4 sm:mt-6 text-center">
              {authUser?.fullName}
            </h2>
            <p className="text-blue-600 text-sm sm:text-base mt-1 text-center">
              {isUpdatingProfile ? "Uploading..." : authUser?.email}
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-3 sm:space-y-4">

          {/* About */}
          <div
            onClick={() => setIsEditingAbout(true)}
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-5 border border-white border-opacity-20 hover:bg-opacity-15 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-500 bg-opacity-30 p-2.5 sm:p-3 rounded-xl">
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-blue-600 text-xs sm:text-sm font-medium">About</p>
                <p className="text-black text-sm sm:text-base mt-1 truncate">
                  {authUser?.about || "Hey there! I am using this messenger"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-300 flex-shrink-0" />
            </div>
          </div>

          {/* Email */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-5 border border-white border-opacity-20 hover:bg-opacity-15 transition-all">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-500 bg-opacity-30 p-2.5 sm:p-3 rounded-xl">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-blue-600 text-xs sm:text-sm font-medium">Email</p>
                <p className="text-black text-sm sm:text-base mt-1 truncate">{authUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-5 border border-white border-opacity-20 hover:bg-opacity-15 transition-all">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-500 bg-opacity-30 p-2.5 sm:p-3 rounded-xl">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-blue-600 text-xs sm:text-sm font-medium">Member Since</p>
                <p className="text-black text-sm sm:text-base mt-1">
                  {new Date(authUser.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-blue-200 text-xs sm:text-sm opacity-75">
            🔒 Your profile is visible to your contacts
          </p>
        </div>
      </div>

      {/* About Edit Modal */}
      {isEditingAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-11/12 sm:w-96 shadow-xl relative">
            
            <button
              onClick={() => setIsEditingAbout(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-4">Edit About</h2>

            <textarea
              className="w-full p-3 border rounded-xl outline-none"
              rows={4}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Write something about yourself..."
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsEditingAbout(false)}
                className="px-4 py-2 bg-gray-300 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleAboutUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
