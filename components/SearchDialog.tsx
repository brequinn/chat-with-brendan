'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AnthropicSpinner } from '@/components/ui/anthropic-spinner'
import { createClient, User } from '@supabase/supabase-js'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import Image from 'next/image'
import { SSE } from 'sse.js'
import { X, Loader, Frown } from 'lucide-react'

function promptDataReducer(
  state: any[],
  action: {
    index?: number
    answer?: string | undefined
    status?: string
    query?: string | undefined
    type?: 'remove-last-item' | string
  }
) {
  let current = [...state]

  if (action.type) {
    switch (action.type) {
      case 'remove-last-item':
        current.pop()
        return [...current]
      default:
        break
    }
  }

  if (action.index === undefined) return [...state]

  if (!current[action.index]) {
    current[action.index] = { query: '', answer: '', status: '' }
  }

  current[action.index].answer = action.answer

  if (action.query) {
    current[action.index].query = action.query
  }
  if (action.status) {
    current[action.index].status = action.status
  }

  return [...current]
}

const supabaseUrl = 'https://yunwshtdhisikfbaaoeu.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Zm94amx4dWFyanJ4cXFhamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAzNzg1ODcsImV4cCI6MjAyNTk1NDU4N30.UYABBjTFmy4dB8WlPOzi8ctLsTzjjLLaAFQYtWn1iKw'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface SearchDialogProps {
  guideName: string
  guideAvatar: string
  pageId: number // Add this line
}

export function SearchDialog({ guideName, guideAvatar, pageId }: SearchDialogProps) {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState<string>('')
  const [question, setQuestion] = React.useState<string>('')
  const [answer, setAnswer] = React.useState<string | undefined>('')
  const eventSourceRef = React.useRef<SSE>()
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [promptIndex, setPromptIndex] = React.useState(0)
  const [promptData, dispatchPromptData] = React.useReducer(promptDataReducer, [])

  const cantHelp = answer?.trim() === "Sorry, I don't know how to help with that."

  function linkifyGoogleDocsLink(text: string): React.ReactNode {
    // Specific Google Docs link to match
    const googleDocsLink =
      'https://docs.google.com/document/d/1CesC9JPxaz0kiF73eKr-bwoLQrkDGAnTZ94t9CdBcx8/edit?usp=sharing'

    return text.split(/\s+/).map((word: string, index: number): React.ReactNode => {
      // Check if the word matches the specific Google Docs link
      if (word === googleDocsLink) {
        // It's the specific Google Docs link, return a hyperlink
        return (
          <a
            key={index}
            href={word}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#007bff', textDecoration: 'underline' }}
          >
            {word}
          </a>
        )
      } else {
        // It's not the specific Google Docs link, return the word as is
        return word + ' ' // Add space for separating words
      }
    })
  }

  const handleModalToggle = React.useCallback(() => {
    setOpen((prevOpen) => {
      return !prevOpen
    })
    setSearch('')
    setQuestion('')
    setAnswer(undefined)
    setPromptIndex(0)
    dispatchPromptData({ type: 'remove-last-item' })
    setHasError(false)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Generate a new session ID every time the component mounts
    // The rest of your useEffect for session checking...
  }, [])

  useEffect(() => {
    // Generate a guide-specific session ID
    const sessionKey = `sessionID-${guideName}` // Unique key for each guide
    const newSessionID = generateSessionID()
    sessionStorage.setItem(sessionKey, newSessionID)
    console.log(`New session ID generated for ${guideName}:`, newSessionID)

    // Function to check user session with Supabase
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error retrieving session:', error)
          return
        }

        if (data?.session) {
          console.log('User ID is:', user?.id)
          console.log('Current session:', data.session)
          setUser(data.session.user) // Set user from session
        } else {
          console.log('No active session')
          setUser(null) // No user is logged in
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    // Execute the session check function
    checkSession()
  }, [guideName]) // Add guideName as a dependency to regenerate session ID if the guide changes

  React.useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error fetching session:', error.message)
        return
      }

      setUser(data?.session?.user ?? null)
    }

    fetchSession()
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        setOpen(true)
      }

      if (e.key === 'Escape') {
        console.log('esc')
        handleModalToggle()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [handleModalToggle])

  const generateSessionID = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const handleConfirm = React.useCallback(
    async (query: string) => {
      console.log('Starting handleConfirm with query:', query)
      console.log('Page ID is...:', pageId) // Log the query
      setAnswer(undefined) // Reset the previous answer
      setQuestion(query) // Set the new question
      setSearch('') // Clear the search input
      dispatchPromptData({ index: promptIndex, answer: undefined, query }) // Update prompt data reducer
      setHasError(false) // Reset error state
      setIsLoading(true) // Indicate loading state

      // Retrieve the guide-specific session ID
      const sessionKey = `sessionID-${guideName}` // Construct the key with the guide's name
      const sessionID = sessionStorage.getItem(sessionKey) // Use the constructed key to retrieve the session ID
      console.log('Using session ID for ' + guideName + ': ' + sessionID)
      if (!sessionID) {
        console.error('Session ID is missing, cannot proceed with fetch.')
        setHasError(true)
        setIsLoading(false)
        return // Early return if sessionID is missing
      }

      try {
        console.log('Sending fetch request to /api/openai with sessionID:', sessionID)
        const response = await fetch('/api/vector-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            sessionID: sessionID, // Pass the guide-specific session ID
            useremail: user?.email,
            userId: user?.id,
            pageId: pageId,
            guideName: guideName,
          }),
        })

        console.log('Fetch request completed. Response status:', response.status)
        if (!response.ok) {
          console.error('Fetch request failed with status:', response.status)
          throw new Error('Failed to fetch from vector search')
        }

        const data = await response.json() // Assuming the API returns JSON
        console.log('Parsed data:', data)

        // Assuming the structure of your API response and extracting the relevant text
        const assistantResponse = data.content[0].text // Adjust this path based on your actual API response structure
        setAnswer(assistantResponse) // Set the assistant's response as the answer
      } catch (err) {
        console.error('Error during fetch operation:', err)
        setHasError(true)
      } finally {
        setIsLoading(false) // Reset loading state
      }

      setPromptIndex((x) => x + 1) // Increment prompt index for the next interaction
    },
    [
      promptIndex,
      user?.email,
      user?.id,
      guideName,
      setAnswer,
      setHasError,
      setIsLoading,
      setQuestion,
    ] // Update dependencies
  )

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    console.log(search)

    handleConfirm(search)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-6 text-base h-16 flex gap-2 items-center px-6 py-2 z-50 relative w-full rounded-full
  text-slate-500 dark:text-slate-400  hover:text-slate-700 dark:hover:text-slate-300 transition-colors border-2 border-black hover:border-black mx-auto"
      >
        <span className="flex flex-row justify-between w-full ml-2 text-base whitespace-nowrap">
          <span className="hidden md:inline">Ask me a question! </span>
          <span className="md:hidden">Message me</span>
          <img src="/assets/arrow.svg" alt="arrow" />
        </span>
      </button>

      <Dialog open={open}>
        <DialogContent className="sm:max-w-[850px] text-black overflow-y-scroll max-h-screen overflow-scroll">
          <DialogHeader>
            <DialogTitle>Chat with Brendan!</DialogTitle>
            {/* <DialogTitle>
              <span>
                Hi {user?.email || 'there'}! I’d love to share the best places in Mexico City with
                you!
              </span>
            </DialogTitle> */}

            {/* <DialogTitle>Chat with {guideName}!</DialogTitle> */}
            {/* <Button onClick={userid}>Show User ID</Button> */}
            {/* <DialogDescription>
              Ask me anything about my career or role expectations
            </DialogDescription> */}
            <hr />
            <button className="absolute top-0 right-2 p-2" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 dark:text-gray-100" />
            </button>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 text-slate-700">
              {question && (
                <div className="flex gap-4 justify-end">
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex-row flex w-10 h-10 rounded-full text-center">
                      {user?.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="User's Avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                          objectFit="cover" // Ensure the image covers the entire area NEED FIX
                        />
                      ) : (
                        <Image
                          src={`https://ui-avatars.com/api/?name=${user?.email
                            ?.charAt(0)
                            .toUpperCase()}&background=FF91A4&color=fff&size=128`}
                          alt="Default Avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      )}
                    </div>
                    <div className="bg-blue-600 rounded-xl p-4 md:ml-40 font-medium text-white">
                      {question}
                    </div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center mt-4">
                  <AnthropicSpinner />
                </div>
              )}

              {hasError && (
                <div className="flex items-center gap-4">
                  <span className="bg-red-100 p-2 w-8 h-8 rounded-full text-center flex items-center justify-center">
                    <Frown width={18} />
                  </span>
                  <span className="text-slate-700 dark:text-slate-100">
                    Sorry about that! Please try asking me again and hopefully I can answer!
                  </span>
                </div>
              )}

              {answer && !hasError ? (
                <div className="flex flex-col gap-4 dark:text-white">
                  <div className="flex flex-row gap-1">
                    <div className="w-10 h-10 rounded-full text-center flex items-center justify-center">
                      <Image
                        src={guideAvatar}
                        alt={guideName + 's Avatar'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </div>
                    <h3 className="font-semibold">{guideName}:</h3>
                  </div>

                  {answer && (
                    <div className="bg-blue-50 rounded-xl p-4 text-black md:mr-40 md:ml-11 md:mt-[-24px]">
                      {linkifyGoogleDocsLink(
                        answer
                          .split('https://www.museofridakahlo.org.mx')
                          .map((part, index, array) =>
                            index < array.length - 1 ? (
                              <React.Fragment key={`museo-${index}`}>
                                {part}
                                <a
                                  href="https://www.museofridakahlo.org.mx/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#007bff', textDecoration: 'underline' }}
                                >
                                  https://www.museofridakahlo.org.mx/
                                </a>
                              </React.Fragment>
                            ) : (
                              part // For the last part, directly return it without linkification
                            )
                          )
                          .join('') // Join the parts back into a string for linkifyGooByLinks to process
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <DialogFooter className="w-full sticky bottom-[-24px] pt-4 pb-6 w-full bg-white">
              <div className="flex flex-col gap-4 w-full">
                <Input
                  placeholder="Ask a question..."
                  name="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 text-lg border border-black col-span-3" // added text-lg for larger text
                />
                <div className="text-xs text-gray-500 dark:text-gray-100">
                  Or try:{' '}
                  <button
                    type="button"
                    className="px-1.5 py-0.5
                    bg-slate-50 dark:bg-gray-500
                    hover:bg-slate-100 dark:hover:bg-gray-600
                    rounded border border-slate-200 dark:border-slate-600
                    transition-colors"
                    onClick={(_) =>
                      setSearch(' How much product management experience do you have?')
                    }
                  >
                    How much product management experience do you have?
                  </button>
                  <button
                    type="button"
                    className="px-1.5 py-0.5
                    bg-slate-50 dark:bg-gray-500
                    hover:bg-slate-100 dark:hover:bg-gray-600
                    rounded border border-slate-200 dark:border-slate-600
                    transition-colors"
                    onClick={(_) => setSearch('What are you looking for in your next role?')}
                  >
                    What are you looking for in your next role?
                  </button>
                  <button
                    type="button"
                    className="px-1.5 py-0.5
                    bg-slate-50 dark:bg-gray-500
                    hover:bg-slate-100 dark:hover:bg-gray-600
                    rounded border border-slate-200 dark:border-slate-600
                    transition-colors"
                    onClick={(_) => setSearch('Have you worked on consumer products before?')}
                  >
                    Have you worked on consumer products before?
                  </button>
                </div>
                <Button type="submit" className="bg-red-500">
                  Message {guideName}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
