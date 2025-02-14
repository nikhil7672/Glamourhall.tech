// app/auth/login/page.tsx
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
import { signIn } from 'next-auth/react'
import toast, { Toaster } from 'react-hot-toast'
import { z } from "zod"
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate input
      const validatedInput = loginSchema.safeParse({ email, password })
      if (!validatedInput.success) {
        setError(validatedInput.error.errors[0].message)
        toast.error(validatedInput.error.errors[0].message)
        return
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Login successful!')

        // Store token and user data
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setTimeout(() => {
          router.push('/chat')
        }, 300)
      } else {
        setError(data.error || 'Login failed')
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signIn('google', { callbackUrl: '/chat' })
      if (result?.error) {
        setError('Google login failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
    finally {
      setIsGoogleLoading(false);
    }
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
          <p className="text-lg opacity-90">
            Your personal fashion assistant awaits
          </p>
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

        <Card className="w-full max-w-md shadow-2xl rounded-2xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 relative z-10 m-6">
          <CardHeader className="space-y-2 text-center pb-4">
          <div className="flex items-center justify-start lg:justify-center w-full mb-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <Image
                  src="/fashion-wear.png"
                  alt="GlamourHall Logo"
                  width={40}
                  height={40}
                  className="h-12 w-12 rounded-full shadow-lg border-2 border-white/20 group-hover:scale-105 transition-transform"
                />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  GlamourHall
                </span>
              </Link>
            </div>
            <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50/80 border border-red-200 text-red-600 text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="pl-11 py-3 rounded-xl bg-white/70 dark:bg-gray-700/50 focus-visible:ring-2 focus-visible:ring-purple-500/50 border-gray-300/50 dark:border-gray-600/50 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="pl-11 py-3 rounded-xl bg-white/70 dark:bg-gray-700/50 focus-visible:ring-2 focus-visible:ring-purple-500/50 border-gray-300/50 dark:border-gray-600/50 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-100/50 dark:hover:bg-gray-600/50"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-base"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/80 dark:bg-gray-800/80 text-gray-500 rounded-lg">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                className="w-full py-4 bg-white/80 hover:bg-white dark:bg-gray-700/80 dark:hover:bg-gray-600/90 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-300/50 dark:border-gray-600/50 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-3 text-base"
                onClick={handleGoogleLogin}
                type="button"
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Image src="/google.png" alt="Google" width={20} height={20} />
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </>
                ) : (
                  <>
                    <Image src="/google.png" alt="Google" width={20} height={20} />
                    Continue with Google
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
            <div className="w-full space-y-3">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 hover:underline transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                By logging in, you agree to our{" "}
                <Link href="/terms-of-service" className="text-purple-600 hover:underline dark:text-purple-400">
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="text-purple-600 hover:underline dark:text-purple-400"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}