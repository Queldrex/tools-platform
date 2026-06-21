import { Metadata } from 'next'
import PromptInjectionPage from './Client'

export const metadata: Metadata = {
  title: 'Free Prompt Injection Detector — Test AI Inputs for Attacks',
  description: 'Test user inputs against 15 deterministic prompt injection patterns. Detects jailbreaks, DAN attacks, instruction overrides, and token smuggling. No AI — pure regex, instant results.',
  openGraph: {
    title: 'Free Prompt Injection Detector — Test AI Inputs for Attacks',
    description: 'Detect prompt injection attacks with 15 regex patterns. Finds jailbreaks, DAN attacks, instruction overrides, and data extraction probes — zero AI, zero false positives.',
    images: [{ url: '/tool-previews/prompt-injection.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Prompt Injection Detector',
    description: 'Test AI inputs for injection attacks with 15 deterministic patterns. No AI, pure regex.',
  },
}

export default PromptInjectionPage
