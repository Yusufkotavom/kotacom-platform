export const redirects = async () => {
  const staticRedirects = [
    {
      // Legacy blog index (/blog) lands on the new article hub.
      source: '/blog',
      destination: '/posts',
      permanent: true,
    },
    // Legacy flat blog URLs (/blog/<slug>) move to the flat post permalink.
    {
      source: '/blog/:slug',
      destination: '/posts/:slug',
      permanent: true,
    },
  ]

  return staticRedirects
}
