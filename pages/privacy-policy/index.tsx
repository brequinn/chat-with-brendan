import React from 'react'
import Link from 'next/link'
import 'tailwindcss/tailwind.css'
import { useEffect, useState } from 'react'
import { createClient, Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import Head from 'next/head'
import { SearchDialog } from '@/components/SearchDialog'
import Image from 'next/image'
import { Alert, Button, Flex, Menu, Spin } from 'antd'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { DownOutlined, SmileOutlined, SearchOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Dropdown, Space, Input } from 'antd'
import { stringify } from 'querystring'

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      {/* nav bar */}
      <header className="w-full flex justify-between items-center p-2 absolute top-0 border-b border-black">
        <div className="max-w-screen-2xl flex w-full justify-between items-center m-auto py-2 mx-4 md:mx-6">
          <div className="max-md:hidden w-[64px]"></div>
          <Link href="/">
            <Image src="/assets/logo.svg" alt="TravelPal" width={104} height={54} />
          </Link>
        </div>
      </header>
      {/* end nav bar */}

      {/* Privacy Policy Content */}
      <main className="px-4 max-w-6xl m-auto pt-12">
        {/* <h1 className="text-3xl md:text-5xl font-semibold text-black mt-8">Privacy Policy</h1>
        <p className="text-base mt-4">Effective date: February 1, 2024</p>
        <p className="text-base mt-4">
          TRAVELPAL PRIVACY POLICY Effective date: 03/01/2024. Introduction: Welcome to the
          TravelPal App. TravelPal (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;) operates the
          www.yourtravelpal.app website (hereinafter referred to as &quot;Service&quot;). Our
          Privacy Policy governs your visit to www.yourtravelpal.app, and explains how we collect,
          safeguard, and disclose information that results from your use of our Service. By using
          the Service, you consent to the collection and use of information in accordance with this
          policy. Definitions: - Service: The www.yourtravelpal.app website operated by TravelPal. -
          Personal Data: Data about a living individual who can be identified from this data (or
          from those and other information either in our possession or likely to come into our
          possession). - Usage Data: Data collected automatically, generated either by the use of
          the Service or from the Service infrastructure itself. Information Collection and Use: We
          collect several different types of information for various purposes to provide and improve
          our Service to you. This includes: - Personal Data: Email address, first name, and last
          name. We use Personal Data to provide a personalized experience and to send you
          information and updates regarding our Service. - Usage Data: This includes information
          such as your computer's Internet Protocol address (e.g., IP address), browser type,
          browser version, and our Service pages that you visit, along with the time and date of
          your visit, the time spent on those pages, and other diagnostic data. Google API Services
          User Data Policy Compliance: In accordance with the Google API Service User Data Policy,
          we are transparent about the way your application accesses, uses, stores, or shares Google
          user data. The collection and use of Google user data are strictly limited to the purposes
          described in this Privacy Policy and in-product privacy notifications. Use of Data: The
          data we collect is used in various ways, including to: - Provide, operate, and maintain
          our Service - Improve, personalize, and expand our Service - Understand and analyze how
          you use our Service - Develop new products, services, features, and functionality -
          Communicate with you, either directly or through one of our partners, including for
          customer service, to provide you with updates and other information relating to the
          Service, and for marketing and promotional purposes - Send you emails - Find and prevent
          fraud. Retention of Data: Your Personal Data will be retained only for as long as is
          necessary for the purposes set out in this Privacy Policy. We will retain and use your
          Personal Data to the extent necessary to comply with our legal obligations, resolve
          disputes, and enforce our policies. Amendments to This Policy: We reserve the right to
          update or change our Privacy Policy at any time. You are advised to review this Privacy
          Policy periodically for any changes. Contact Us: For any questions or suggestions about
          our Privacy Policy, do not hesitate to contact us at brendanquinn89@gmail.com.
        </p> */}
      </main>
      {/* End Privacy Policy Content */}

      {/* Footer */}
      <footer className="w-full py-4 text-center">
        <p className="text-white">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
        </p>
      </footer>
      {/* End Footer */}
    </>
  )
}

export default PrivacyPolicyPage
