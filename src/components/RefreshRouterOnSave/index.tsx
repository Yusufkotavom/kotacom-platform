'use client'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export const RefreshRouteOnSave: React.FC = () => {
  const router = useRouter()
  const serverURL = process.env.NEXT_PUBLIC_SITE_URL

  // PayloadLivePreview calls window.parent.postMessage(..., serverURL). When
  // serverURL is an empty string the call throws
  // `Failed to execute 'postMessage' on 'Window': Invalid target origin ''`,
  // which crashes hydration on every page that mounts this component. Render
  // nothing until a valid build-time URL is configured.
  if (!serverURL) return null

  return <PayloadLivePreview refresh={() => router.refresh()} serverURL={serverURL} />
}
