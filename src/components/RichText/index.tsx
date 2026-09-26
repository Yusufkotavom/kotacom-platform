'use client'

import type { Reference } from '@components/CMSLink'
import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { SerializedLabelNode } from '@root/fields/richText/features/label/LabelNode'
import type { SerializedLargeBodyNode } from '@root/fields/richText/features/largeBody/LargeBodyNode'
import type { DownloadBlockType } from '@types'

import { CMSLink } from '@components/CMSLink'
import { Label } from '@components/Label'
import { LargeBody } from '@components/LargeBody'
import RichTextUpload from '@components/RichText/Upload'

import './index.scss'

import {
  type JSXConverters,
  type JSXConvertersFunction,
  RichText as SerializedRichText,
} from '@payloadcms/richtext-lexical/react'
import { Download } from '@root/components/blocks/Download'
import React from 'react'

import { CustomTableJSXConverters } from './Table/index'

type Props = {
  className?: string
  content: any
}

export type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<DownloadBlockType>
  | SerializedLabelNode
  | SerializedLargeBodyNode

// Block slugs here must stay in sync with the lexical BlocksFeature in
// payload.config.ts. The docs-only blocks (Arrow, Banner, BulletList, Card, Code,
// LightDarkImage, PayloadMedia, Pill, Resource, RestExamples, TableWithDrawers,
// VideoDrawer, YouTube, ...) were removed with the docs subsystem.
export const jsxConverters: (args: { toc?: boolean }) => JSXConvertersFunction<NodeTypes> =
  () =>
  ({ defaultConverters }) => {
    const converters: JSXConverters<NodeTypes> = {
      ...defaultConverters,
      ...CustomTableJSXConverters,
      blocks: {
        downloadBlock: ({ node }) => {
          return <Download {...node.fields} />
        },
      },
      label: ({ node, nodesToJSX }) => {
        return <Label>{nodesToJSX({ nodes: node.children })}</Label>
      },
      largeBody: ({ node, nodesToJSX }) => {
        return <LargeBody>{nodesToJSX({ nodes: node.children })}</LargeBody>
      },
      link: ({ node, nodesToJSX }) => {
        const fields = node.fields

        return (
          <CMSLink
            newTab={Boolean(fields?.newTab)}
            reference={fields.doc as Reference}
            type={fields.linkType === 'internal' ? 'reference' : 'custom'}
            url={fields.url}
          >
            {nodesToJSX({ nodes: node.children })}
          </CMSLink>
        )
      },
      upload: ({ node }) => {
        return <RichTextUpload node={node} />
      },
    }

    return converters
  }

export const RichText: React.FC<Props> = ({ className, content }) => {
  if (!content) {
    return null
  }

  return (
    <SerializedRichText
      className={['payload-richtext', className].filter(Boolean).join(' ')}
      converters={jsxConverters({ toc: false })}
      data={content}
    />
  )
}
