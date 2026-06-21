import { Metadata } from 'next'
import ProposalGeneratorPage from './Client'

export const metadata: Metadata = {
  title: 'Free Business Proposal Generator — Professional Proposals in Seconds',
  description: 'Generate a complete, client-ready business proposal with 9 structured sections. Enter your scope and get a polished proposal with executive summary, timeline, and investment framing.',
  openGraph: {
    title: 'Free Business Proposal Generator — Professional Proposals in Seconds',
    description: 'Turn rough notes into a complete business proposal with 9 sections: executive summary, scope, timeline, investment, and next steps.',
    images: [{ url: '/tool-previews/proposal-generator.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Business Proposal Generator',
    description: 'Generate professional business proposals with 9 sections in seconds.',
  },
}

export default ProposalGeneratorPage
