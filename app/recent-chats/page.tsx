"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, MessageCircle, Search, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isStarred: boolean;
}

const RecentChatsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample chat data (Replace with API fetch)
  const [chats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Summer Outfit Advice',
      lastMessage: 'The color combination looks great! Try adding...',
      timestamp: new Date(),
      isStarred: true,
    },
    {
      id: '2',
      title: 'Wedding Guest Dress',
      lastMessage: 'For a formal evening wedding, I would recommend...',
      timestamp: new Date(Date.now() - 3600000),
      isStarred: true,
    },
    {
      id: '3',
      title: 'Casual Friday Look',
      lastMessage: 'Smart casual is the way to go. Consider...',
      timestamp: new Date(Date.now() - 86400000),
      isStarred: false,
    },
    // Add more sample chats as needed
  ]);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/chat" className="flex items-center text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back to Chat
              </Link>
              <h1 className="text-xl font-semibold">Recent Chats</h1>
            </div>
            <MessageCircle className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chats List */}
      <ScrollArea className="max-w-7xl mx-auto px-4 h-[calc(100vh-200px)]">
        <div className="space-y-2">
          {/* Starred Chats */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
              <Star className="w-4 h-4 mr-2" /> Starred Conversations
            </h2>
            {filteredChats.filter(chat => chat.isStarred).map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 mb-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{chat.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{chat.lastMessage}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(chat.timestamp, 'MMM d, h:mm a')}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Chats */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2" /> Recent Conversations
            </h2>
            {filteredChats.filter(chat => !chat.isStarred).map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 mb-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{chat.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{chat.lastMessage}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(chat.timestamp, 'MMM d, h:mm a')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentChatsPage;