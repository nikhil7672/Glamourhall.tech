'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon } from 'lucide-react'
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
        // Registration successful, redirect to login page
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
      const result = await signIn('google', { callbackUrl: '/' })
      if (result?.error) {
        setError('Google sign-up failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <Card className="w-full max-w-md shadow-2xl rounded-lg bg-white">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-extrabold text-purple-700">Create an account</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your information to create your GlamourHall account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  required
                  className="pl-10 py-3 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  required
                  className="pl-10 py-3 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Create a password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-10 py-3 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
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

            <Button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition duration-300">
              Register
            </Button>
          </form>
          <div className="mt-4">
            <Button
              className="w-full py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300 shadow-md flex items-center justify-center"
              onClick={handleGoogleSignUp}
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
              Sign up with Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center mt-4">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-600 hover:underline">
              Log in
            </Link>
          </p>
          <p className="text-center text-xs text-gray-600 mt-2">
            By registering, you agree to GlamourHall's{' '}
            <Link href="/terms" className="text-purple-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-purple-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}