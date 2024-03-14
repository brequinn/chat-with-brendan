import { useEffect, useState } from 'react'
import { createClient, Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import Head from 'next/head'
import { SearchDialog } from '@/components/SearchDialog'
import Image from 'next/image'
import Link from 'next/link'
import 'tailwindcss/tailwind.css'
import { Alert, Button, Flex, Menu, Spin } from 'antd'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { DownOutlined, SmileOutlined, SearchOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Dropdown, Space, Input } from 'antd'
import { stringify } from 'querystring'

const supabaseUrl = 'https://zxfoxjlxuarjrxqqajel.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bndzaHRkaGlzaWtmYmFhb2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAxMTI0NTcsImV4cCI6MjAyNTY4ODQ1N30.-w9Fzj26j9RjQZztidot0iwKESGStAQLJrjAyLpU4pk'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Home() {
  const passwordInputRef = useRef(null)
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [guides, setGuides] = useState<Array<any>>([])
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [selectedCity, setSelectedCity] = useState('Mexico City')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false) // State to control view: register or login
  const [isLoadingGuides, setIsLoadingGuides] = useState(true)
  const router = useRouter() // Initialize the router

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'NA'
  const userAvatar =
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${initials}&background=FF91A4&color=fff&size=128`

  const fetchGuides = () => {
    new Promise<any[]>(async (resolve, reject) => {
      // Explicitly declare the Promise type
      await supabase
        .from('guides')
        .select('*')
        .then((response) => {
          console.log('is guides working?')
          console.log('this is the response' + JSON.stringify(response))
        })
    })
      .then((data) => {
        // TypeScript now knows 'data' is of type 'any[]'
        // Update state with fetched guides
        setGuides(data)
        console.log('Guides state after update:', data)
        console.log('Guides fetched successfully:', data)
      })
      .catch((error) => {
        console.error('Error fetching guides:', error)
      })
      .finally(() => {
        setIsLoadingGuides(false)
      })
  }

  useEffect(() => {
    // Mock data for one guide
    const guides = [
      {
        name: 'Brendan',
        avatar: '/images/paseana-avatar.png',
        country: 'Mexico',
        location: 'Mexico City',
        bio: 'Ask me about anything about my career or what I am looking for next',
        specialties: 'Bars, Cantinas, Tequila, Mezcal, 🌮 Tacos, Dancing, Museums, Markets, Parks',
        image: '/images/paseana-cover.png',
        social: 'https://www.instagram.com/foodhoodtours/',
        page_id: 3,
      },
    ]

    setGuides(guides)
    setIsLoadingGuides(false)
  }, [])

  return (
    <>
      {/* nav bar */}
      <header className="w-full flex justify-between items-center p-2 absolute top-0">
        <div className="max-w-6xl md:m-auto flex w-full justify-between items-center py-2 mx-4">
          <Link href="/">
            <img src="/assets/brendan-logo.png" alt="TravelPal" width={500} height={354} />
          </Link>
        </div>
      </header>
      {/* end nav bar */}
      {/* hero */}
      <main
        style={{
          backgroundColor: '#F0F0EB',
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-6xl w-full pt-[150px] m-auto">
          <div className="grid lg:grid-cols-2 gap-4 mx-4"></div>
        </div>
        {/* end hero */}
        <div className="">
          <div className="min-h-screen px-4 max-w-6xl m-auto">
            <div className="text-base md:text-lg pt-4 mb-4 text-zinc-500">
              <h3 className="text-3xl font-semibold text-black mt-12 mb-8">
                Hi! My name is Brendan. This is my personal chatbot trained on my resume and
                knowledge. Ask me anything!!
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {isLoadingGuides ? (
                <Spin tip="Loading guides" size="large" style={{ marginTop: 150 }}>
                  <div className="content" />
                </Spin>
              ) : (
                guides.map((guide, index) => (
                  <div
                    className="bg-white rounded-3xl p-5 hover:shadow-xl max-w-2xl transition:all duration-500 ease-in-out"
                    key={index}
                  >
                    <div className="info-container">
                      <p className="text-zinc-500 mt-4">
                        {guide.bio.length > 100 ? guide.bio.slice(0, 100) + '...' : guide.bio}
                      </p>

                      <div className="flex items-center mt-2 text-blue-600 cursor-pointer"></div>
                    </div>
                    <div className="mt-4">
                      <SearchDialog
                        guideName={guide.name}
                        guideAvatar={guide.avatar}
                        pageId={guide.page_id}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-center relative inline-block"></div>
        </div>
        <footer className="w-full text-center py-4   absolute bottom-0">
          Made with{' '}
          <img src="/assets/anthropic-logo.png" alt="logo" style={{ height: '50', width: '30' }} />
        </footer>
      </main>
    </>
  )
}
