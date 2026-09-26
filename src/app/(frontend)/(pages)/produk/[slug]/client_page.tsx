'use client'

import type { Product as ProductT } from '@root/payload-types'

import { BackgroundGrid } from '@components/BackgroundGrid/index'
import { BlockWrapper } from '@components/BlockWrapper/index'
import { Gutter } from '@components/Gutter/index'
import BreadcrumbsBar from '@components/Hero/BreadcrumbsBar/index'
import { Media } from '@components/Media/index'
import { RenderBlocks } from '@components/RenderBlocks/index'
import React from 'react'

import classes from './index.module.scss'

const OFFERING_LABEL: Record<string, string> = {
  service: 'Layanan',
  portfolio: 'Portofolio',
  product: 'Produk',
}

export const Product: React.FC<ProductT> = (props) => {
  const {
    category,
    featuredImage,
    gallery,
    layout,
    offeringType,
    price,
    shortDescription,
    specs,
    title,
  } = props

  return (
    <React.Fragment>
      <BreadcrumbsBar
        breadcrumbs={[
          { label: 'Produk & Layanan', url: '/produk' },
          { label: title },
        ]}
        links={[{ label: 'Konsultasi Gratis', url: '/kontak' }]}
      />
      <BlockWrapper padding={{ top: 'small' }} settings={{}}>
        <BackgroundGrid />
        <Gutter className={classes.hero}>
          <div className={['grid'].filter(Boolean).join(' ')}>
            <div className={['cols-6 cols-m-8', classes.content].filter(Boolean).join(' ')}>
              <div className={classes.titleWrap}>
                <span className={classes.badge}>
                  {OFFERING_LABEL[offeringType ?? 'service'] ?? 'Layanan'}
                </span>
                <h1 className={classes.title}>{title}</h1>
                {shortDescription && <p className={classes.shortDescription}>{shortDescription}</p>}
              </div>
              {(category || price) && (
                <div className={classes.metaWrapper}>
                  {category && (
                    <div className={classes.metaItem}>
                      <p className={classes.metaLabel}>Kategori</p>
                      <p className={classes.metaValue}>{category}</p>
                    </div>
                  )}
                  {price && (
                    <div className={classes.metaItem}>
                      <p className={classes.metaLabel}>Harga</p>
                      <p className={classes.metaValue}>{price}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {typeof featuredImage !== 'string' && featuredImage && (
              <div className="cols-8 start-8 start-m-1">
                <Media className={classes.featuredImage} priority resource={featuredImage} />
              </div>
            )}
          </div>
        </Gutter>

        {Array.isArray(specs) && specs.length > 0 && (
          <Gutter>
            <div className={['grid', classes.specs].filter(Boolean).join(' ')}>
              <div className={['cols-4 start-1 cols-m-8', classes.specsHeading].filter(Boolean).join(' ')}>
                <p className={classes.eyebrow}>Detail</p>
                <p className={classes.specsTitle}>Spesifikasi</p>
              </div>
              <dl className={['cols-11 start-6 cols-m-8', classes.specsList].filter(Boolean).join(' ')}>
                {specs.map((spec, i) => (
                  <div className={classes.specRow} key={i}>
                    <dt className={classes.specLabel}>{spec.label}</dt>
                    <dd className={classes.specValue}>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Gutter>
        )}
      </BlockWrapper>

      {Array.isArray(gallery) && gallery.length > 0 && (
        <Gutter>
          <div className={classes.gallery}>
            {gallery.map((item, i) =>
              typeof item.image !== 'string' && item.image ? (
                <figure className={classes.galleryItem} key={i}>
                  <Media className={classes.galleryImage} resource={item.image} />
                  {item.caption && <figcaption className={classes.galleryCaption}>{item.caption}</figcaption>}
                </figure>
              ) : null,
            )}
          </div>
        </Gutter>
      )}

      {Array.isArray(layout) && <RenderBlocks blocks={layout} />}
    </React.Fragment>
  )
}
