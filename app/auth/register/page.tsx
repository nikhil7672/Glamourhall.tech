'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon, LockIcon, Sparkles } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        router.push('/auth/login')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleGoogleSignUp = async () => {
    try {
      const result = await signIn('google', { callbackUrl: '/dashboard' })
      if (result?.error) {
        setError('Google sign-up failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Fashion Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/boy.jpg"
          alt="Fashion background"
          fill
          className="object-cover"
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Join GlamourHall</h2>
          <p className="text-lg opacity-90">Start your fashion journey today</p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative">
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="/boy.jpg"
            alt="Fashion background"
            fill
            className="object-cover"
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-blue-900/60 to-black/70 mix-blend-multiply" />
        </div>
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100" />
        
        <Card className="w-full max-w-md shadow-xl rounded-xl bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 relative z-10 m-6">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="flex items-center justify-center mb-1">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Create Account
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Enter your information to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    required
                    className="pl-9 py-2 rounded-lg bg-white/50 dark:bg-gray-800 focus:bg-white focus:dark:bg-gray-700 transition-all border-gray-200 text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="pl-9 py-2 rounded-lg bg-white/50 dark:bg-gray-800 focus:bg-white focus:dark:bg-gray-700 transition-all border-gray-200 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    className="pl-9 py-2 rounded-lg bg-white/50 dark:bg-gray-800 focus:bg-white focus:dark:bg-gray-700 transition-all border-gray-200 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>

              <Button
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition duration-300 shadow-md text-sm"
                type="submit"
              >
                Create Account
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
  className="w-full py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 transition duration-300 shadow-sm flex items-center justify-center gap-2 text-sm"
  onClick={handleGoogleSignUp}
  type="button"
>
  <Image src="/google.png" alt="Google" width={16} height={16} />
  Sign up with Google
</Button>
            </form>
          </CardContent>

          <CardFooter className="border-t pt-4">
            <div className="w-full space-y-2">
              <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 hover:underline"
                >
                  Log in
                </Link>
              </p>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                By registering, you agree to our{' '}
                <Link href="/terms" className="text-purple-600 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}