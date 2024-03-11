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

const TermsofServicePage: React.FC = () => {
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
        <h1 className="text-3xl md:text-5xl font-semibold text-black mt-8">Terms of Service</h1>
        <p className="text-base mt-4">
          Travel Pal Terms of Service Welcome to Travel Pal! These Terms of Service
          (&quot;Terms&quot;) govern your use of the Travel Pal website, mobile application, and any
          related services (collectively, the &quot;Service&quot;) provided by Travel Pal, Inc.
          (&quot;Travel Pal,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing
          or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you
          do not agree to these Terms, please do not use the Service. 1. Acceptance of Terms By
          creating an account, downloading our app, or otherwise accessing or using the Service, you
          affirm that you are of legal age to enter into these Terms or, if you are not, that you
          have obtained parental or guardian consent to enter into these Terms. 2. Changes to Terms
          of Service We reserve the right to update or modify these Terms at any time without prior
          notice. Your continued use of the Service after any such changes indicates your acceptance
          of the new Terms. 3. Use of the Service Travel Pal grants you a limited, non-exclusive,
          non-transferable, and revocable license to use the Service strictly in accordance with
          these Terms. You agree not to use the Service for any purpose that is illegal or
          prohibited by these Terms. 4. Account Registration You may be required to register an
          account to access certain features of the Service. You agree to provide accurate, current,
          and complete information during the registration process and to update such information to
          keep it accurate, current, and complete. 5. User Content You may post, upload, publish,
          submit, or transmit content, including but not limited to photos, reviews, and comments
          (&quot;User Content&quot;). By making available any User Content on or through the
          Service, you grant Travel Pal a worldwide, irrevocable, perpetual, non-exclusive,
          transferable, royalty-free license, with the right to sublicense, to use, view, copy,
          adapt, modify, distribute, license, sell, transfer, publicly display, publicly perform,
          transmit, stream, broadcast, and otherwise exploit such User Content. 6. Prohibited
          Conduct You agree not to engage in any of the following prohibited activities: (i)
          copying, distributing, or disclosing any part of the Service in any medium; (ii) using any
          automated system, including without limitation &quot;robots,&quot; &quot;spiders,&quot;
          &quot;offline readers,&quot; etc., to access the Service; (iii) attempting to interfere
          with, compromise the system integrity or security, or decipher any transmissions to or
          from the servers running the Service. 7. Termination We may terminate or suspend your
          account and bar access to the Service immediately, without prior notice or liability, for
          any reason whatsoever, including, without limitation, a breach of the Terms. 8. Disclaimer
          of Warranties The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;
          basis. Travel Pal expressly disclaims all warranties of any kind, whether express or
          implied, including, but not limited to, the implied warranties of merchantability, fitness
          for a particular purpose, and non-infringement. 9. Limitation of Liability In no event
          shall Travel Pal, its officers, directors, employees, or agents, be liable for any
          indirect, incidental, special, consequential or punitive damages, or any loss of profits
          or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill,
          or other intangible losses, resulting from (i) your access to or use of or inability to
          access or use the Service; (ii) any conduct or content of any third party on the Service;
          (iii) any content obtained from the Service; and (iv) unauthorized access, use, or
          alteration of your transmissions or content. 10. Governing Law These Terms shall be
          governed by the laws of the State of [Your State/Country], without respect to its conflict
          of laws principles. 11. Contact Information If you have any questions about these Terms,
          please contact us at support@travelpal.com. Thank you for choosing Travel Pal!
        </p>
        {/* Add your TOS content here */}
      </main>
      {/* End Privacy Policy Content */}

      {/* Footer */}
      <footer className="w-full py-4 text-center">
        <p className="text-white">
          <Link href="/privacy-policy" className="text-white mr-4">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-white">
            Terms of Service
          </Link>
        </p>
      </footer>
      {/* End Footer */}
    </>
  )
}

export default TermsofServicePage
