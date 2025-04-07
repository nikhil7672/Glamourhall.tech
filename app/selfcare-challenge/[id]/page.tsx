"use client";
import { motion } from "framer-motion";
import { FaCheckCircle, FaChevronLeft, FaLeaf, FaFire, FaTrophy } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Task {
  id: string;
  challenge_id: string;
  day: number;
  task: string;
  completed?: boolean;
}

const ChallengeProgressPage = ({ params }: { params: { id: string } }) => {
  const { status } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentDay, setCurrentDay] = useState(2);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challengeData, setChallengeData] = useState(null);

  const challengeId = params.id;

  useEffect(() => {
    setProgress(tasks.filter(task => task.completed).length);
  }, [tasks]);

  useEffect(() => {
    const checkAuth = () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (status === "unauthenticated" && !token) {
        window.location.href = "/auth/login";
      }
    };

    checkAuth();
  }, [status]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = localStorage.getItem('user');
        const userId = user ? JSON.parse(user).id : null;

        // First fetch the tasks
        const tasksResponse = await fetch(`/api/tasks?challengeId=${challengeId}`);
        if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
        const tasksData = await tasksResponse.json();

        // Then fetch the progress status
        const progressResponse = await fetch(
          `/api/task_progress?userId=${userId}&challengeId=${challengeId}`
        );
        if (!progressResponse.ok) throw new Error('Failed to fetch progress');
        const progressData = await progressResponse.json();

        // Merge tasks with their progress status
        setTasks(tasksData.tasks.map((task: Task) => ({
          ...task,
          completed: progressData?.taskProgress?.some(
            (p: any) => p.task_id === task.id && p.is_completed
          )
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (challengeId) fetchTasks();
  }, [challengeId]);

  const toggleTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : null;
      const task = tasks.find(t => t.id === taskId);
      
      if (!userId || !task) {
        throw new Error('User ID or task not found');
      }

      const response = await fetch('/api/task_progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          challengeId: challengeId,
          taskId: taskId,
          isCompleted: !task.completed
        })
      });

      if (!response.ok) throw new Error('Failed to update task progress');

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      console.error("Error updating task:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6">
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
            {challengeData?.title}
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
              <span className="font-semibold">Day {currentDay} of {Math.max(...tasks.map(task => task.day))}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{progress}/{tasks.length} tasks</span>
              <div className="w-32 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress / tasks.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Tasks */}
        <div className="grid gap-4 mb-8">
          <h2 className="text-xl font-bold mb-4">Day {currentDay} Missions</h2>
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          )}

          {error && (
            <div className="p-4 mb-4 text-red-500 bg-red-100 dark:bg-red-900/20 rounded-xl">
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            tasks
              .filter(task => task.day === currentDay)
              .map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.02 }}
                  className="group flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <span className={`${task.completed ? 'line-through opacity-50' : ''}`}>
                      {task.task}
                    </span>
                    {task.task.includes('(') && (
                      <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {task.task.match(/\(([^)]+)\)/)?.[1]}
                      </span>
                    )}
                  </div>
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
              ))
          )}
        </div>

        {/* Challenge Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6">Challenge Timeline</h2>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: Math.max(...tasks.map(task => task.day)) }, (_, i) => ({
              day: i + 1,
              locked: i + 1 > currentDay,
              completed: i + 1 < currentDay,
            })).map((day) => (
              <motion.div
                key={day.day}
                whileHover={{ scale: 1.1 }}
                onClick={() => !day.locked && setCurrentDay(day.day)}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all
                  ${day.locked ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-default' : 'cursor-pointer'}
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

export default ChallengeProgressPage; 