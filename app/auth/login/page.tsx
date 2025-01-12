'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        router.push('/')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Fashion Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/lgbg.jpg"
          alt="Fashion background"
          fill
          className="object-cover"
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Style Redefined</h2>
          <p className="text-lg opacity-90">Your personal fashion assistant awaits</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative">
      <div className="absolute inset-0 lg:hidden">
          <Image
            src="/lgbg.jpg"
            alt="Fashion background"
            fill
            className="object-cover"
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-blue-900/60 to-black/70 mix-blend-multiply" />
        </div>
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100" />
        <Card className="w-full max-w-md shadow-xl rounded-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/90">
          <CardHeader className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Log in to your GlamourHall account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    placeholder="Enter your email" 
                    type="email" 
                    required 
                    className="pl-10 py-3 rounded-lg bg-white/50 dark:bg-gray-800 focus:bg-white focus:dark:bg-gray-700 transition-all border-gray-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 py-3 rounded-lg bg-white/50 dark:bg-gray-800 focus:bg-white focus:dark:bg-gray-700 transition-all border-gray-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox" 
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </label>
                </div>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                className="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition duration-300 shadow-md"
                type="submit"
              >
                Log in
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="border-t pt-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}