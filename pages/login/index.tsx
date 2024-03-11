import React, { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { notification } from 'antd'
import Link from 'next/link'

type NotificationType = 'success' | 'info' | 'warning' | 'error'

const supabaseUrl = 'https://hjrqutqbqfmkhathadmg.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcnF1dHFicWZta2hhdGhhZG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY3ODg0MzMsImV4cCI6MjAwMjM2NDQzM30.P8S-5e8KPZCaviQpRwNZJX-mdwvt46cckSsr-DnVP8I'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const Login = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const passwordInputRef = useRef(null)

  const openNotificationWithIcon = (type: string, message: string, description: string) => {
    ;(notification as any)[type]({
      message: message,
      description: description,
    })
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      openNotificationWithIcon('error', 'Empty Fields', 'Please fill in all fields.')
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      openNotificationWithIcon('error', 'Login Failed', error.message)
      return
    }

    if (data.user) {
      openNotificationWithIcon('success', 'Login Success', `Logged in as ${data.user.email}`)
      router.push('/') // Redirect to home page or dashboard
    }
  }

  async function handleRegister() {
    if (!email.trim() || !password.trim()) {
      openNotificationWithIcon('error', 'Empty Fields', 'Please fill in all fields.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      openNotificationWithIcon('error', 'Registration Failed', error.message)
      return
    }

    if (data.user) {
      openNotificationWithIcon(
        'success',
        'Registration Success',
        'User registered successfully, please login.'
      )
      setIsRegister(false) // Switch to login form
      // Optionally, pre-fill email and password for the user
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) {
      openNotificationWithIcon('error', 'Sign In Failed', error.message)
    }
  }

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
    })

    if (error) {
      openNotificationWithIcon('error', 'Sign In Failed', error.message)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900">
        <div className="grid lg:grid-cols-2 justify-center min-h-screen overflow-x-hidden">
          <div
            className="order-2 lg:order-1 col-span-1 bg-cover lg:block w-screen lg:w-full"
            style={{ backgroundImage: 'url(/images/bg.png)', backgroundColor: '#F2F2F2' }}
          >
            <div className="flex items-center min-h-full py-20 w-full justify-center px-4 lg:p-8">
              <div className="w-full">
                <h2 className="text-3xl font-bold md:text-5xl text-center max-w-lg m-auto">
                  Your personal travel expert{' '}
                  <span className="text-[#6C47FF]">anytime, anywhere.</span>
                </h2>
                <p className="max-w-96 mt-3 text-sm text-black text-center m-auto">
                  With TravelPal, you&apos;re never alone. Powered by a local guide&apos;s
                  expertise, TravelPal&apos;s AI companion gives instant access to expert knowledge
                  and local insights
                </p>
                <img
                  className="mt-12 max-w-[450px] ml-auto mr-auto w-full"
                  src="/images/feature.png"
                  alt="Travelpal"
                />
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex items-center justify-center w-full max-w-md px-6 mx-auto overflow-x-hidden">
            <div className="flex-1 min-h-full py-20">
              <div className="text-center">
                <div className="flex justify-center mx-auto">
                  <img className="w-auto h-16" src="/assets/logo.svg" alt="Travelpal Logo" />
                </div>
              </div>

              <div>
                {isRegister ? (
                  <>
                    {/* Signup content */}
                    <div className="text-center">
                      <div className="flex justify-center mx-auto">
                        <p className="mt-3 text-gray-500 dark:text-gray-300">
                          Sign up to get access
                        </p>
                      </div>
                    </div>
                    <div className="mt-8">
                      <div>
                        <label
                          htmlFor="email"
                          className="block mb-2 text-sm text-gray-600 dark:text-gray-200"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          placeholder="example@example.com"
                          className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between mb-2">
                          <label
                            htmlFor="password"
                            className="text-sm text-gray-600 dark:text-gray-200"
                          >
                            Password
                          </label>
                        </div>

                        <input
                          type="password"
                          name="password"
                          id="password"
                          placeholder="Your Password"
                          className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          ref={passwordInputRef}
                        />
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={handleRegister}
                          className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-blue-500 rounded-full hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Login content */}
                    <div className="text-center">
                      <div className="flex justify-center mx-auto">
                        <p className="mt-3 text-gray-500 dark:text-gray-300">Welcome back!</p>
                      </div>
                    </div>
                    <div className="mt-8">
                      <div>
                        <label
                          htmlFor="email"
                          className="block mb-2 text-sm text-gray-600 dark:text-gray-200"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          placeholder="example@example.com"
                          className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between mb-2">
                          <label
                            htmlFor="password"
                            className="text-sm text-gray-600 dark:text-gray-200"
                          >
                            Password
                          </label>
                        </div>

                        <input
                          type="password"
                          name="password"
                          id="password"
                          placeholder="Your Password"
                          className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={handleLogin}
                          className="w-full px-4 py-2 text-white transition-colors duration-300 transform bg-blue-500 rounded-full hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                        >
                          Sign in
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-1">
                  <button
                    onClick={signInWithGoogle}
                    className="w-full px-4 py-2 text-gray-700 bg-white rounded-full flex justify-center justify-between border border-gray-300 focus:ring-blue focus:border-blue-400 focus:ring-opacity-50 focus:outline-none hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 40 40">
                      <path
                        d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                        fill="#FFC107"
                      />
                      <path
                        d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                        fill="#FF3D00"
                      />
                      <path
                        d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                        fill="#4CAF50"
                      />
                      <path
                        d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                        fill="#1976D2"
                      />
                    </svg>
                    Continue with Google
                    <span />
                  </button>
                </div>

                {/* <div className="mt-1">
                  <button
                    onClick={signInWithFacebook}
                    className="w-full px-4 py-2 text-gray-700 bg-white rounded-full flex justify-center justify-between border border-gray-300 focus:ring-blue focus:border-blue-400 focus:ring-opacity-50 focus:outline-none hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 40 40">
                      <path
                        d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                        fill="#FFC107"
                      />
                      <path
                        d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                        fill="#FF3D00"
                      />
                      <path
                        d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                        fill="#4CAF50"
                      />
                      <path
                        d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                        fill="#1976D2"
                      />
                    </svg>
                    Continue with Facebook
                    <span />
                  </button>
                </div> */}

                {isRegister ? (
                  <p className="mt-6 text-sm text-center text-gray-400">
                    Already have an account?{' '}
                    <button
                      className="text-blue-500 focus:outline-none focus:underline hover:underline"
                      onClick={() => setIsRegister(false)}
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p className="mt-6 text-sm text-center text-gray-400">
                    Don&apos;t have an account yet?{' '}
                    <button
                      className="text-blue-500 focus:outline-none focus:underline hover:underline"
                      onClick={() => setIsRegister(true)}
                    >
                      Sign up
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-center text-white">
        <Link style={{ color: 'blue' }} href="/privacy-policy">
          Privacy Policy
        </Link>
        {' | '}
        <Link style={{ color: 'blue' }} href="/terms-of-service">
          Terms of Service
        </Link>
      </p>
    </>
  )
}
export default Login
