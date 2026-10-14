'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import PaginatedReport from './PaginatedReport'

export const ReportFieldComponent: React.FC<{ path: string }> = ({ path }) => {
  const { value } = useField<any[]>({ path })
  return <PaginatedReport report={value || []} />
}

export default ReportFieldComponent
