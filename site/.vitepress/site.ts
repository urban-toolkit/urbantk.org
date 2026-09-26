// Site-wide settings, shared by the config, the Node helpers and the checks.
export const SITE = {
  title: 'The Urban Toolkit',
  description: 'A suite of tools for urban visual analytics',
  hostname: 'https://urbantk.org',
  github: 'https://github.com/urban-toolkit',
  // Open Graph image for pages that have none of their own.
  image: '/media/brand/utk-social.png',
  // Category order of the home page sections, as on the old site. The menu follows categories.yaml.
  homeOrder: ['dataflow', 'grammars', 'knowledge', 'ai'],
  newsOnHome: 6,
  // The project diagram in the home page hero: categories clockwise from the left, as on the
  // 2026 NSF CSSI poster, around the logo at the center.
  ecosystem: {
    order: ['dataflow', 'knowledge', 'grammars', 'ai'],
    center: '/media/brand/utk-circle.webp',
  },
  // Papers listed under "Others" in the Knowledge bases section of the home page.
  others: [
    { bib: 'ferreira2024landscape', label: 'Landscape of tools for urban visual analytics' },
    { bib: 'mota2023comparison', label: 'Comparison of visualizations for 3D urban analytics' },
  ],
  funding: {
    lead: 'Our work has been supported by:',
    sponsors: [
      {
        name: 'National Science Foundation (NSF)',
        awards: [
          { id: '2320261', url: 'https://www.nsf.gov/awardsearch/showAward?AWD_ID=2320261' },
          { id: '2330565', url: 'https://www.nsf.gov/awardsearch/showAward?AWD_ID=2330565' },
          { id: '2411223', url: 'https://www.nsf.gov/awardsearch/showAward?AWD_ID=2411223' },
        ],
      },
      { name: 'Discovery Partners Institute (DPI)' },
      { name: 'IDOT' },
    ],
  },
  // The two logos of the old site's footer. Both are black, so dark mode shows them inverted.
  institutions: [
    { name: 'Electronic Visualization Laboratory', url: 'https://evl.uic.edu', logo: '/media/institutions/evl.png' },
    { name: 'UIC Computer Science', url: 'https://cs.uic.edu/', logo: '/media/institutions/uic.png' },
  ],
}
