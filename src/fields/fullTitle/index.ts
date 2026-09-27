import type { Field } from 'payload'

import populateFullTitle from './populateFullTitle'

export const fullTitle: Field = {
  name: 'fullTitle',
  type: 'text',
  admin: {
    // `hidden` is the supported way to keep a field out of the admin UI while
    // still storing/computing it. Using `components: { Field: false }` produced
    // a broken client component reference that halted the entire Pages edit
    // view render (0 fields shown, no error).
    hidden: true,
  },
  hooks: {
    beforeChange: [populateFullTitle],
  },
}
