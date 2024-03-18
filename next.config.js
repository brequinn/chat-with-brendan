/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  darkMode: 'false',
  env: {
    SERVER: process.env.SERVER,
  },
  images: {
    domains: ['foodhoodtours.com', 'lh3.googleusercontent.com', 'ui-avatars.com'],
  },
}
