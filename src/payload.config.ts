import { revalidateRedirects } from '@hooks/revalidateRedirects'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import link from '@root/fields/link'
import { LabelFeature } from '@root/fields/richText/features/label/server'
import { LargeBodyFeature } from '@root/fields/richText/features/largeBody/server'
import { googleAnalytics } from '@zubricks/plugin-google-analytics'
import { revalidateTag } from 'next/cache'
import nodemailerSendgrid from 'nodemailer-sendgrid'
import path from 'path'
import { buildConfig, type TextField } from 'payload'
import { fileURLToPath } from 'url'

import { AiContent } from './blocks/AiContent'
import { Banner } from './blocks/Banner'
import { BlogContent } from './blocks/BlogContent'
import { BlogMarkdown } from './blocks/BlogMarkdown'
import { Callout } from './blocks/Callout'
import { CallToAction } from './blocks/CallToAction'
import { CardGrid } from './blocks/CardGrid'
import { CaseStudiesHighlight } from './blocks/CaseStudiesHighlight'
import { CaseStudyCards } from './blocks/CaseStudyCards'
import { CaseStudyParallax } from './blocks/CaseStudyParallax'
import { Code } from './blocks/Code'
import { CodeFeature } from './blocks/CodeFeature'
import { ComparisonTable } from './blocks/ComparisonTable'
import { Content } from './blocks/Content'
import { ContentGrid } from './blocks/ContentGrid'
import { DownloadBlock } from './blocks/Download'
import { CodeExampleBlock, ExampleTabs, MediaExampleBlock } from './blocks/ExampleTabs'
import { Form } from './blocks/Form'
import { HoverCards } from './blocks/HoverCards'
import { HoverHighlights } from './blocks/HoverHighlights'
import { LinkGrid } from './blocks/LinkGrid'
import { LogoGrid } from './blocks/LogoGrid'
import { MediaBlock } from './blocks/Media'
import { MediaContent } from './blocks/MediaContent'
import { MediaContentAccordion } from './blocks/MediaContentAccordion'
import { Pricing } from './blocks/Pricing'
import { ReusableContent as ReusableContentBlock } from './blocks/ReusableContent'
import { Slider } from './blocks/Slider'
import { Statement } from './blocks/Statement'
import { Steps } from './blocks/Steps'
import { StickyHighlights } from './blocks/StickyHighlights'
import { WhatsAppCTA as WhatsAppCTABlock } from './blocks/WhatsAppCTA'
import { CaseStudies } from './collections/CaseStudies'
import { Categories } from './collections/Categories'
import { GeneratorDatasets } from './collections/GeneratorDatasets'
import { GeneratorPrograms } from './collections/GeneratorPrograms'
import { GeneratorRuns } from './collections/GeneratorRuns'
import { GeneratorTemplates } from './collections/GeneratorTemplates'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { ReusableContent } from './collections/ReusableContent'
import { Users } from './collections/Users'
import { Footer } from './globals/Footer'
import { MainMenu } from './globals/MainMenu'
import { SiteSettings } from './globals/SiteSettings'
import { TopBar } from './globals/TopBar'
import { WhatsAppMarketing } from './globals/WhatsAppMarketing'
import { opsCounterPlugin } from './plugins/opsCounter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const sendGridAPIKey = process.env.SENDGRID_API_KEY

const sendgridConfig = {
  transportOptions: nodemailerSendgrid({
    apiKey: sendGridAPIKey,
  }),
}

export default buildConfig({
  admin: {
    importMap: {
      baseDir: dirname,
    },
  },
  blocks: [
    AiContent,
    BlogContent,
    BlogMarkdown,
    CodeExampleBlock,
    MediaExampleBlock,
    Callout,
    CallToAction,
    DownloadBlock,
    CardGrid,
    CaseStudyCards,
    CaseStudiesHighlight,
    CaseStudyParallax,
    CodeFeature,
    Content,
    ContentGrid,
    ComparisonTable,
    Form,
    HoverCards,
    HoverHighlights,
    LinkGrid,
    LogoGrid,
    MediaBlock,
    MediaContent,
    MediaContentAccordion,
    Pricing,
    ReusableContentBlock,
    Slider,
    Statement,
    Steps,
    StickyHighlights,
    ExampleTabs,
    Code,
    Banner,
    WhatsAppCTABlock,
    // Link/command button blocks used by the "three" hero CTA (see fields/hero.ts).
    {
      slug: 'link',
      fields: [link()],
      labels: { plural: 'Links', singular: 'Link' },
    },
    {
      slug: 'command',
      fields: [{ name: 'command', type: 'text', required: true }],
      labels: { plural: 'Commands', singular: 'Command' },
    },
  ],
  collections: [
    CaseStudies,
    Products,
    Media,
    Pages,
    Posts,
    Categories,
    ReusableContent,
    Users,
    GeneratorTemplates,
    GeneratorDatasets,
    GeneratorPrograms,
    GeneratorRuns,
  ],
  cors: [process.env.PAYLOAD_PUBLIC_APP_URL || ''].filter(Boolean),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  defaultDepth: 1,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== 'link'),
      LinkFeature({
        fields({ defaultFields }) {
          return [
            ...defaultFields.filter((field) => field.name !== 'url'),
            {
              // Own url field to disable URL encoding links starting with '../'
              name: 'url',
              type: 'text',
              label: ({ t }) => t('fields:enterURL'),
              required: true,
              validate: (value: string, options) => {
                return
              },
            } as TextField,
          ]
        },
      }),
      EXPERIMENTAL_TableFeature(),
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'enableLink',
                type: 'checkbox',
                label: 'Enable Link',
              },
              link({
                appearances: false,
                disableLabel: true,
                overrides: {
                  admin: {
                    condition: (_, data) => Boolean(data?.enableLink),
                  },
                },
              }),
            ],
          },
        },
      }),
      LabelFeature(),
      LargeBodyFeature(),
      BlocksFeature({
        blocks: ['downloadBlock'],
      }),
    ],
  }),
  email: nodemailerAdapter({
    defaultFromAddress: 'no-reply@kotacom.id',
    defaultFromName: 'Kotacom',
    ...sendgridConfig,
  }),
  globals: [Footer, MainMenu, TopBar, SiteSettings, WhatsAppMarketing],
  graphQL: {
    disablePlaygroundInProduction: false,
  },
  plugins: [
    opsCounterPlugin({
      max: 200,
      warnAt: 25,
    }),
    googleAnalytics({
      // Optional: Configure which widgets to enable
      enabledWidgets: ['analytics-overview', 'top-pages', 'active-users', 'channel-groups'],
    }),
    formBuilderPlugin({
      formOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'hubSpotFormID',
            type: 'text',
            admin: {
              position: 'sidebar',
            },
            label: 'HubSpot Form ID',
          },
          {
            name: 'customID',
            type: 'text',
            admin: {
              description: 'Attached to submission button to track clicks',
              position: 'sidebar',
            },
            label: 'Custom ID',
          },
          {
            name: 'requireRecaptcha',
            type: 'checkbox',
            admin: {
              position: 'sidebar',
            },
            label: 'Require reCAPTCHA',
          },
        ],
        hooks: {
          afterChange: [
            ({ doc }) => {
              revalidateTag(`form-${doc.title}`, { expire: 0 })
            },
          ],
        },
      },
      formSubmissionOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'recaptcha',
            type: 'text',
            validate: async (value, { req, siblingData }) => {
              const form = await req.payload.findByID({
                id: siblingData?.form,
                collection: 'forms',
              })

              if (!form?.requireRecaptcha) {
                return true
              }

              if (!value) {
                return 'Please complete the reCAPTCHA'
              }

              const res = await fetch(
                `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.NEXT_PRIVATE_RECAPTCHA_SECRET_KEY}&response=${value}`,
                {
                  method: 'POST',
                },
              )
              const data = await res.json()
              if (!data.success) {
                return 'Invalid captcha'
              } else {
                return true
              }
            },
          },
        ],
        hooks: {
          afterChange: [
            async ({ doc, req }) => {
              req.payload.logger.info('Form Submission Received')
              req.payload.logger.info(Object.fromEntries(req?.headers.entries()))

              const body = req.json ? await req.json() : {}

              const sendSubmissionToHubSpot = async (): Promise<void> => {
                const { form, submissionData: submissionDataFromDoc } = doc
                const portalID = process.env.NEXT_PRIVATE_HUBSPOT_PORTAL_KEY

                const submissionData = submissionDataFromDoc

                const data = {
                  context: {
                    ...('hubspotCookie' in body && { hutk: body?.hubspotCookie }),
                    pageName: 'pageName' in body ? body?.pageName : '',
                    pageUri: 'pageUri' in body ? body?.pageUri : '',
                  },
                  fields: submissionData.map((key) => ({
                    name: key.field,
                    value: key.value,
                  })),
                }

                try {
                  await fetch(
                    `https://api.hsforms.com/submissions/v3/integration/submit/${portalID}/${form.hubSpotFormID}`,
                    {
                      body: JSON.stringify(data),
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      method: 'POST',
                    },
                  )
                } catch (err: unknown) {
                  req.payload.logger.error({
                    err,
                    msg: 'Fetch to HubSpot form submissions failed',
                  })
                }
              }
              await sendSubmissionToHubSpot()
            },
          ],
          beforeChange: [
            async ({ data }) => {
              return data
            },
          ],
        },
      },
    }),
    seoPlugin({
      collections: ['case-studies', 'pages', 'posts'],
      uploadsCollection: 'media',
    }),
    nestedDocsPlugin({
      collections: ['pages'],
      generateLabel: (_, doc) => doc.title as string,
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug as string}`, ''),
    }),
    redirectsPlugin({
      collections: ['case-studies', 'pages', 'posts'],
      overrides: {
        hooks: {
          afterChange: [revalidateRedirects],
        },
      },
    }),
    mcpPlugin({
      mcp: {
        serverOptions: {
          serverInfo: {
            name: 'Payload MCP Server',
            version: '1.0.0',
          },
        },
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
