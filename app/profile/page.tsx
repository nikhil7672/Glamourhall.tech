// app/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { FaCamera, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [bio, setBio] = useState("Fashion enthusiast and style seeker");
  
  const stats = [
    { label: "Style Chats", value: "23" },
    { label: "Saved Looks", value: "45" },
    { label: "Following", value: "102" },
    { label: "Followers", value: "89" },
  ];

  const handleSave = () => {
    // Handle save logic here
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-[7rem] md:py-8">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 md:h-64 rounded-2xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500" />
          </div>

          {/* Profile Image */}
          <div className="absolute -bottom-16 left-4 md:left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                <Image
                  src={session?.user?.image || "/default-avatar.png"}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors">
                <FaCamera size={16} />
              </button>
            </div>
          </div>

          {/* Edit Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors"
            >
              {isEditing ? (
                <>
                  <FaTimes size={16} />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <FaEdit size={16} />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-20 md:mt-16">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 text-2xl font-bold bg-transparent border-b-2 border-purple-300 focus:border-purple-500 outline-none"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border-2 border-purple-300 rounded-lg focus:border-purple-500 outline-none"
                rows={3}
              />
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
              >
                <FaSave size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <p className="mt-2 text-gray-600">{bio}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl font-bold text-purple-500">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="grid gap-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-purple-100" />
                  <div>
                    <h3 className="font-medium">Style Chat #{index + 1}</h3>
                    <p className="text-sm text-gray-600">
                      Discussed summer fashion trends and got personalized recommendations
                    </p>
                    <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}