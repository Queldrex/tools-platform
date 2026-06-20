'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: number
}

const STARTER_PROMPTS = [
  'How do I detect a phishing email?',
  'What is a zero-day exploit?',
  'How should I harden a new Linux server?',
  'Explain SQL injection in simple terms.',
  "What's the difference between a virus and ransomware?",
  'How do I set up 2FA properly?',
  'What is SSL/TLS and why does it matter?',
  'How do I secure an API?',
]

const RESPONSES: Record<string, string> = {
  phishing: `Phishing emails have consistent tells:\n\n**Sender mismatch** — The display name says "PayPal" but the actual address is paypal-secure@randomdomain.ru. Always expand the full sender field.\n\n**Urgency language** — "Your account will be suspended in 24 hours!" is a manipulation tactic. Legitimate companies rarely demand immediate action via email.\n\n**Hover before you click** — Hover over any link. If the URL doesn't match the stated destination, it's a trap.\n\n**Attachment suspicion** — .exe, .zip, .docm files from unknown senders are almost always malicious.\n\n**Generic greeting** — "Dear Customer" instead of your actual name is a red flag for bulk phishing.\n\nIf in doubt: go directly to the company's website by typing the URL yourself, never via the email link.`,

  'zero-day': `A zero-day is a vulnerability the software vendor doesn't know about yet — so they've had zero days to fix it.\n\n**The lifecycle:**\n1. A researcher or attacker discovers a flaw in software\n2. If malicious: they exploit it before a patch exists\n3. When the vendor discovers it: they race to release a fix\n4. After the patch ships: it's no longer technically a zero-day\n\nZero-days are extremely valuable. Nation-state actors pay millions for working exploits in widely-used software.\n\n**Best defenses:**\n• Patch aggressively the moment fixes are available\n• Layer your defenses so a single exploit doesn't mean total compromise\n• Use application allowlisting to prevent unknown executables from running`,

  harden: `Server hardening checklist:\n\n**Immediately after provisioning:**\n• Change all default credentials\n• Update everything: \`apt update && apt upgrade -y\`\n• Disable root SSH login (\`PermitRootLogin no\` in sshd_config)\n• Set up key-based authentication, disable password auth\n\n**Firewall:**\n• Enable UFW: allow only ports 22, 80, 443\n• Default deny inbound, allow outbound\n\n**Services:**\n• Disable unused services: \`systemctl disable <service>\`\n• Remove unnecessary packages\n\n**Monitoring:**\n• Install fail2ban for SSH brute-force protection\n• Set up auditd for system call logging\n• Configure log shipping to a centralized system\n\n**Ongoing:**\n• Enable automatic security updates\n• Review access logs weekly`,

  sql: `SQL injection is when an attacker inserts SQL code into an input field that gets executed by your database.\n\n**Classic example:**\nLogin form expects: \`username = 'john'\`\nAttacker enters: \`' OR '1'='1\`\nQuery becomes: \`SELECT * FROM users WHERE username='' OR '1'='1'\` — which returns all users.\n\n**Why it's dangerous:**\n• Bypasses authentication\n• Exposes or deletes your entire database\n• Can be used to read files from the server\n\n**Prevention:**\n• Use parameterized queries / prepared statements — never concatenate user input into SQL strings\n• Use an ORM (Prisma, SQLAlchemy, ActiveRecord)\n• Validate and sanitize all inputs\n• Apply principle of least privilege to DB users`,

  ransomware: `**Virus:** Self-replicates by attaching to other files and spreading. Goal is usually disruption or damage. Requires a host file.\n\n**Ransomware:** A type of malware that encrypts your files and demands payment for the decryption key. Goal is financial extortion.\n\nKey differences:\n• Ransomware is a category of malware with a specific extortion model\n• Ransomware actors are highly organized criminal enterprises (often with support teams)\n• Recovery from ransomware without the key is often impossible\n\n**Prevention:**\n• Offline backups (the 3-2-1 rule: 3 copies, 2 media types, 1 offsite)\n• Patch aggressively — ransomware spreads via known vulnerabilities\n• Restrict RDP access and use MFA\n• Email filtering to block malicious attachments`,

  '2fa': `Two-factor authentication adds a second check beyond your password.\n\n**Types, ranked by security:**\n1. **Hardware keys (FIDO2/WebAuthn)** — Gold standard. YubiKey or passkey. Phishing-proof.\n2. **Authenticator app (TOTP)** — Google Authenticator, Authy, 1Password. Generates rotating 6-digit codes. Much better than SMS.\n3. **SMS codes** — Vulnerable to SIM swapping attacks. Better than nothing, but avoid for sensitive accounts.\n4. **Email codes** — As secure as your email account. Acceptable for low-risk accounts.\n\n**Set it up:**\n• Use an authenticator app for anything financial, email, or work-related\n• Store your backup codes in a password manager\n• Enable 2FA on your password manager itself using a hardware key if possible\n\n**Critical:** Never share a 2FA code with anyone. Legitimate services never ask for it over the phone.`,

  ssl: `SSL (now TLS) is the encryption layer that protects data in transit between a browser and a server.\n\n**What it does:**\n• Encrypts the connection so attackers can't read data in transit\n• Authenticates the server's identity via certificates\n• Ensures data integrity (no tampering in transit)\n\n**Why it matters:**\n• Without it, anyone on the same network can read login credentials, form data, and sessions\n• Modern browsers flag HTTP sites as "Not Secure"\n• Google downranks non-HTTPS sites\n• Required for payment processing (PCI-DSS)\n\n**For your site:**\n• Get a free certificate from Let's Encrypt\n• Enforce HTTPS-only via redirect and HSTS headers\n• Use TLS 1.2 or 1.3 only — disable older versions\n• Check your config at ssllabs.com/ssltest`,

  api: `API security checklist:\n\n**Authentication:**\n• Never accept unauthenticated requests on sensitive endpoints\n• Use short-lived tokens (JWTs with 15min expiry) + refresh tokens\n• Rotate API keys regularly and on suspected compromise\n\n**Authorization:**\n• Verify the authenticated user is authorized for each specific resource\n• Never trust user-supplied IDs without ownership checks\n• Apply principle of least privilege to every API consumer\n\n**Input validation:**\n• Validate and sanitize all inputs server-side — client-side is cosmetic only\n• Use allowlists, not denylists\n• Set strict rate limits on all endpoints\n\n**Transport:**\n• HTTPS only, enforce HSTS\n• Don't log sensitive data (passwords, tokens, PII)\n\n**Monitoring:**\n• Alert on unusual call patterns\n• Log all auth failures with IP and timestamp`,

  owasp: `The OWASP Top 10 is the standard list of the most critical web application security risks:\n\n1. **Broken Access Control** — Users accessing resources they shouldn't\n2. **Cryptographic Failures** — Weak encryption, data transmitted in plaintext\n3. **Injection** — SQL injection, command injection, XSS\n4. **Insecure Design** — Missing security requirements from the design phase\n5. **Security Misconfiguration** — Default creds, unnecessary features enabled\n6. **Vulnerable Components** — Outdated libraries with known CVEs\n7. **Auth Failures** — Weak passwords, no MFA, credential stuffing\n8. **Integrity Failures** — Untrusted deserialization, insecure CI/CD\n9. **Logging Failures** — Not detecting or alerting on attacks\n10. **SSRF** — Server making requests to attacker-controlled destinations\n\nFor AI-generated code specifically: injection and access control failures are the most common issues we see.`,

  breach: `If you suspect your credentials are in a breach:\n\n**Immediate steps:**\n1. Change the password on the breached service immediately\n2. Change the same password anywhere else you used it (password reuse is dangerous)\n3. Enable 2FA on the affected account if you haven't already\n4. Check your email for unauthorized logins or account changes\n5. Run a breach check on your email at haveibeenpwned.com\n\n**Longer term:**\n• Use a password manager — unique, random passwords everywhere\n• Never reuse passwords across services\n• Set up breach monitoring alerts for your email addresses\n• Consider a credit freeze if financial data was exposed\n\n**What attackers do with breached credentials:**\n• Credential stuffing — try your email/password on hundreds of other services\n• Account takeover for financial gain\n• Selling the data to other attackers`,

  default: `That's a good security question. The honest answer depends on your specific threat model — who you're protecting against, what you're protecting, and what your attack surface looks like.\n\nFor detailed analysis specific to your situation, contact us at hello@queldrex.com.\n\nIn the meantime, try asking about a specific topic:\n• Phishing detection\n• Zero-day vulnerabilities\n• Server hardening\n• SQL injection\n• Ransomware vs viruses\n• Two-factor authentication setup\n• SSL/TLS\n• API security\n• OWASP Top 10\n• What to do after a data breach`,
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('phish')) return RESPONSES.phishing
  if (lower.includes('zero-day') || lower.includes('zero day') || lower.includes('zeroday')) return RESPONSES['zero-day']
  if (lower.includes('harden') || lower.includes('linux server') || lower.includes('secure server')) return RESPONSES.harden
  if (lower.includes('sql') || lower.includes('injection')) return RESPONSES.sql
  if (lower.includes('ransomware') || lower.includes('virus') || lower.includes('malware')) return RESPONSES.ransomware
  if (lower.includes('2fa') || lower.includes('two-factor') || lower.includes('two factor') || lower.includes('authenticator')) return RESPONSES['2fa']
  if (lower.includes('ssl') || lower.includes('tls') || lower.includes('https') || lower.includes('certificate')) return RESPONSES.ssl
  if (lower.includes('api') || lower.includes('endpoint')) return RESPONSES.api
  if (lower.includes('owasp') || lower.includes('top 10')) return RESPONSES.owasp
  if (lower.includes('breach') || lower.includes('leaked') || lower.includes('compromised')) return RESPONSES.breach
  return RESPONSES.default
}

let msgId = 0

export default function SecurityAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi — I'm the Queldrex Security Assistant.\n\nAsk me anything about cybersecurity: threats, vulnerabilities, hardening, best practices, or what to do after a breach. I'll give you a direct, technical answer.\n\nFor analysis of your specific systems or code, contact us at hello@queldrex.com.",
    id: msgId++,
  }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || typing) return
    setMessages(prev => [...prev, { role: 'user', content, id: msgId++ }])
    setInput('')
    setTyping(true)
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700))
    setMessages(prev => [...prev, { role: 'assistant', content: getResponse(content), id: msgId++ }])
    setTyping(false)
  }

  const reset = () => {
    setMessages([{ role: 'assistant', content: 'Session cleared. What do you need?', id: msgId++ }])
    setInput('')
    setTyping(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070b14' }}>
      <Header />

      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#070b14' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/25 hover:text-white/50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Tools
            </Link>
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-sm font-black text-white">Security Assistant</h1>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(6,182,212,0.1)', color: '#06d6ff', border: '1px solid rgba(6,182,212,0.2)' }}>
                  Free
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] text-white/30">Online · Cybersecurity Q&A</span>
              </div>
            </div>
          </div>
          <button onClick={reset} className="text-white/20 hover:text-white/50 transition-colors p-1.5 rounded-lg hover:bg-white/5" title="Clear conversation">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg flex-shrink-0 mt-1 flex items-center justify-center"
                  style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
              )}
              <div className={`max-w-[82%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className="px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={msg.role === 'user'
                    ? { background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#e2e8f0' }
                    : { background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] font-mono text-white/20">
                  {msg.role === 'assistant' ? 'Queldrex Security Assistant' : 'You'}
                </span>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg flex-shrink-0 mt-1 flex items-center justify-center"
                style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="px-4 py-3 rounded-xl flex items-center gap-1.5"
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    style={{ animation: `typing-dot 1s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="max-w-3xl mx-auto px-6 pb-4 w-full">
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)}
                className="text-[10px] text-white/35 border rounded-lg px-3 py-2 hover:text-white/60 hover:border-white/20 transition-all text-left"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#070b14' }}>
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask a security question..."
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none"
              style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', minHeight: 44, maxHeight: 120 }}
              onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              className="px-4 py-3 rounded-xl flex-shrink-0 transition-all hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-[9px] font-mono text-white/20 mt-2 text-center">
            Enter to send · Shift+Enter for new line · For site-specific analysis contact hello@queldrex.com
          </p>
        </div>
      </div>

      <Footer />
      <style>{`@keyframes typing-dot { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  )
}
