"use client";
import { motion } from "framer-motion";
import { FaCheckCircle, FaChevronLeft, FaLeaf, FaFire, FaTrophy } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ChallengeProgress = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [tasks, setTasks] = useState([
    { id: 1, description: "Morning cleanse with salicylic acid", completed: false },
    { id: 2, description: "Apply spot treatment", completed: false },
    { id: 3, description: "Drink 8 glasses of water", completed: false },
    { id: 4, description: "Nighttime moisturizing routine", completed: false },
  ]);

  const challengeData = {
    id: params.id,
    title: "Acne Assassin Challenge",
    duration: 7,
    progress: (progress / tasks.length) * 100,
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      locked: i + 1 > currentDay,
      completed: i + 1 < currentDay,
    })),
  };

  useEffect(() => {
    setProgress(tasks.filter(task => task.completed).length);
  }, [tasks]);

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto pb-[7rem] md:pb-0">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
            {challengeData.title}
          </h1>
        </div>

        {/* Progress Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaTrophy className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold">Day {currentDay} of {challengeData.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{progress}/{tasks.length} tasks</span>
              <div className="w-32 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${challengeData.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Tasks */}
        <div className="grid gap-4 mb-8">
          <h2 className="text-xl font-bold mb-4">Today's Missions</h2>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ scale: 1.02 }}
              className="group flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <span className={`${task.completed ? 'line-through opacity-50' : ''}`}>
                {task.description}
              </span>
              <button
                onClick={() => toggleTask(task.id)}
                className={`p-2 rounded-lg transition-colors ${
                  task.completed 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-500'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FaCheckCircle className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Challenge Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6">Challenge Timeline</h2>
          <div className="grid grid-cols-7 gap-2">
            {challengeData.days.map((day) => (
              <motion.div
                key={day.day}
                whileHover={{ scale: 1.1 }}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all
                  ${day.locked ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : ''}
                  ${day.completed ? 'bg-green-100 dark:bg-green-900/50 text-green-500' : ''}
                  ${day.day === currentDay ? 'bg-gradient-to-br from-red-500 to-orange-400 text-white shadow-lg' : ''}
                `}
              >
                {day.completed ? '✓' : day.day}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 p-6 bg-gradient-to-br from-red-100 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaLeaf className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold">Daily Skincare Tip</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {currentDay === 1 
              ? "Start your day with a gentle cleanser to remove impurities without stripping natural oils."
              : "Always follow your treatment with a non-comedogenic moisturizer to maintain skin barrier function."}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ChallengeProgress; 