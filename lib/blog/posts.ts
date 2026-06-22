export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: number
  category: string
  content: string
}

export const posts: BlogPost[] = [
  {
    slug: 'what-is-ai-visibility',
    title: 'What Is AI Visibility? The Metric Every Business Needs in 2026',
    description: 'AI search engines like ChatGPT and Perplexity are replacing Google for millions of queries. AI Visibility is the measure of how well your business shows up in those results.',
    date: '2026-06-20',
    readTime: 6,
    category: 'Guide',
    content: `
<h2>The Search Revolution Nobody Warned You About</h2>
<p>Three years ago, if someone needed a plumber in Denver, they Googled it. They got a list of ten blue links, clicked a few, compared reviews, and called someone. That behavior is changing - fast.</p>
<p>Today, millions of people open ChatGPT and type: <strong>"What's the best plumber in Denver?"</strong> They get a direct answer. A recommendation. Maybe a few names. Maybe yours - or maybe not.</p>
<p>This is the shift that's blindsiding small businesses right now. And it's why AI Visibility has become one of the most important metrics you've never heard of.</p>

<h2>What Is AI Visibility?</h2>
<p>AI Visibility measures how well your business can be found, understood, and recommended by AI-powered search engines - tools like ChatGPT, Perplexity, Google's AI Overviews, Microsoft Copilot, and others that are increasingly the first place people go for answers.</p>
<p>It's not the same as your Google ranking. You can have a first-page Google presence and still be completely invisible to AI search engines. Why? Because AI systems don't just crawl the web the same way Google does. They rely on:</p>
<ul>
  <li><strong>Structured data</strong> - schema markup that tells AI systems exactly who you are, what you do, and where you're located</li>
  <li><strong>Citation networks</strong> - consistent mentions of your business name, address, and phone number across directories, review sites, and trusted sources</li>
  <li><strong>Topical authority</strong> - content that establishes your expertise on specific topics relevant to your business</li>
  <li><strong>Crawler access</strong> - whether your robots.txt and technical setup actually lets AI bots read your site</li>
</ul>

<h2>Why It's Different From Traditional SEO</h2>
<p>Traditional SEO is about ranking for keywords. You optimize your page so Google's algorithm scores it higher than your competitors' pages for specific search terms. The goal is a blue link on page one.</p>
<p>AI search doesn't work like that. When someone asks ChatGPT to recommend a plumber, ChatGPT isn't sorting a list of URLs by keyword relevance. It's synthesizing information from its training data and real-time web sources to construct a confident answer. The businesses it names are ones it has learned to associate with reliability, location, and expertise.</p>
<p>This means the signals that matter are fundamentally different:</p>
<ul>
  <li>Keywords matter less; <strong>entity recognition</strong> matters more (is your business recognized as a distinct, trustworthy entity?)</li>
  <li>Backlink counts matter less; <strong>citation consistency</strong> matters more (is your NAP - Name, Address, Phone - consistent across dozens of sources?)</li>
  <li>Meta descriptions matter less; <strong>schema markup</strong> matters more (have you told AI systems exactly what your business is in machine-readable format?)</li>
  <li>Page speed rankings matter less; <strong>crawlability</strong> matters more (can GPTBot and PerplexityBot actually read your site?)</li>
</ul>

<h2>The 3 Pillars of AI Visibility</h2>
<h3>1. Structured Data</h3>
<p>Schema markup is the language AI systems use to understand your business at a machine level. A <code>LocalBusiness</code> schema on your homepage tells ChatGPT your business name, address, phone number, hours, and service area - in a format it can read without guessing. Without schema, AI systems have to infer these facts from your content, and inference is where errors and omissions creep in.</p>

<h3>2. Consistent Citations</h3>
<p>AI models are trained on massive datasets of web content. When your business appears consistently across Yelp, Google Business Profile, BBB, Angi, Foursquare, and dozens of other directories - with the same name, address, and phone number every time - that consistency signals reliability. Inconsistent or missing citations mean AI systems either skip you or recommend you with low confidence.</p>

<h3>3. Topical Authority</h3>
<p>If you want AI to recommend you for emergency plumbing in Denver, you need to be recognized as an authority on plumbing in Denver. That means content that answers the specific questions your customers ask: "How do I fix a burst pipe?", "What are signs of a gas leak?", "How much does water heater replacement cost in Colorado?" The businesses that answer these questions well, consistently, earn the topical authority that makes AI systems trust them as sources.</p>

<h2>What a Low AI Visibility Score Actually Costs You</h2>
<p>Here's the uncomfortable math: if 30% of your potential customers are now starting their search on an AI tool instead of Google, and your AI Visibility score is low, you're losing roughly 30% of your top-of-funnel traffic before they even get to your website.</p>
<p>For a business that gets 100 inquiries a month, that's 30 inquiries a month going to a competitor who showed up in ChatGPT and you didn't. At even a modest close rate, that's real money walking out the door every single month.</p>
<p>And it's only going to accelerate. Gartner projects that AI search will handle the majority of information queries by 2027. The businesses that optimize for AI visibility now will compound that advantage over the next two years. The ones that wait will face a much steeper climb.</p>

<h2>How to Check Your AI Visibility Score</h2>
<p>The fastest way to understand where you stand is to run a full AI visibility audit. The <a href="/scanner">Queldrex AI Visibility Scanner</a> checks 14 signals across your website and online presence - from schema markup and robots.txt configuration to citation consistency and content depth - and gives you an overall score with specific, prioritized fixes.</p>
<p>The scan takes about 60 seconds and shows you exactly what AI systems see when they evaluate your business. It's free to run and gives you a clear starting point.</p>
<p>The businesses winning on AI search aren't doing anything magical. They're doing the foundational work: structured data, consistent citations, crawlable sites, and authoritative content. The window to get ahead of this is now - before your competitors figure it out.</p>
    `.trim(),
  },
  {
    slug: 'is-your-business-on-chatgpt',
    title: 'Is Your Business on ChatGPT? How to Find Out (And Fix It If Not)',
    description: "Millions of people ask ChatGPT to recommend local businesses, products, and services every day. Here's how to check if your business shows up - and what to do if it doesn't.",
    date: '2026-06-19',
    readTime: 5,
    category: 'How-To',
    content: `
<h2>How ChatGPT Decides What Businesses to Recommend</h2>
<p>ChatGPT doesn't have a phone book. When someone asks it to recommend a roofing company in Phoenix, it's pulling from two sources: its training data (a snapshot of a massive portion of the web, frozen at a point in time) and, when real-time search is enabled, live web results through Bing.</p>
<p>The businesses that get recommended are the ones that appeared most reliably across trustworthy sources in that training data - and the ones that are crawlable, well-structured, and consistently cited online right now.</p>
<p>If your business isn't showing up, it's usually one of a small number of fixable problems.</p>

<h2>How to Manually Test If ChatGPT Mentions Your Business</h2>
<p>Before fixing anything, confirm the problem. Open ChatGPT (or any AI search tool) and try these queries - swap in your actual business type, city, and name:</p>
<ul>
  <li>"What are the best [your service] companies in [your city]?"</li>
  <li>"Recommend a [your service] near [your neighborhood or zip code]"</li>
  <li>"Who does [specific service] in [your city]?"</li>
  <li>"[Your business name] - what do you know about them?"</li>
</ul>
<p>If your business name doesn't appear in any of these responses, you have an AI visibility problem. If ChatGPT knows your name exists but gets your address, services, or specialty wrong, you have a data consistency problem - which is actually more dangerous, because wrong information actively works against you.</p>

<h2>The 5 Most Common Reasons AI Ignores Your Business</h2>

<h3>1. Your robots.txt blocks AI crawlers</h3>
<p>This is the most common and most fixable issue. Many websites were built with robots.txt rules designed to block unknown bots - a reasonable security precaution at the time. But GPTBot (OpenAI), PerplexityBot, ClaudeBot (Anthropic), and other AI crawlers are now blocked by these rules, which means the AI systems powering ChatGPT and Perplexity literally cannot read your website.</p>
<p>Check your robots.txt at <code>yourdomain.com/robots.txt</code>. If you see <code>Disallow: /</code> under any bot rules, or if AI crawlers aren't explicitly allowed, this is your first fix.</p>

<h3>2. No schema markup on your site</h3>
<p>Schema markup is machine-readable code that tells AI systems what your business is, where it's located, what it does, and how to contact you. Without it, AI systems have to guess - and they often guess wrong or simply skip businesses they can't confidently identify.</p>
<p>A basic <code>LocalBusiness</code> JSON-LD block on your homepage, containing your name, address, phone number, hours, and service area, can make the difference between showing up and being invisible.</p>

<h3>3. Inconsistent or missing directory listings</h3>
<p>AI models are trained on web data, and web data includes directories. Yelp, Google Business Profile, BBB, Manta, Foursquare, Angi, HomeAdvisor - if your business isn't listed in these places, or if your name, address, and phone number differ across them, AI systems lose confidence in recommending you.</p>
<p>Inconsistent NAP (Name, Address, Phone) is one of the clearest signals of an unreliable business presence. AI systems treat it the same way humans do: if the details don't match, something seems off.</p>

<h3>4. Thin or no relevant content</h3>
<p>If your website is a five-page brochure with no depth, AI systems have very little to learn from you. They can't establish you as an authority on your subject matter. The businesses that get recommended are typically the ones with content that answers the specific questions their customers ask.</p>

<h3>5. No Google Business Profile (or an unclaimed one)</h3>
<p>Google Business Profile data is one of the primary sources AI systems use for local business information. An unclaimed or incomplete profile means you're either invisible or represented with bad data. This is a 10-minute fix with outsized impact.</p>

<h2>Quick Fixes You Can Do Today</h2>
<ul>
  <li><strong>Check and fix robots.txt</strong> - allow GPTBot, PerplexityBot, ClaudeBot explicitly</li>
  <li><strong>Add LocalBusiness schema</strong> - use Google's Structured Data Markup Helper to generate the JSON-LD and paste it into your homepage</li>
  <li><strong>Claim your Google Business Profile</strong> - business.google.com, verify your listing, fill out every field</li>
  <li><strong>Check your top 5 directory listings</strong> - Yelp, BBB, Manta, Foursquare, Angi - make sure name/address/phone match exactly</li>
  <li><strong>Add a strong About page</strong> - your expertise, your team, your location, your history - in plain language that AI can read and understand</li>
</ul>

<h2>Get the Full Picture in 60 Seconds</h2>
<p>Manual testing tells you what AI says about you today, but it doesn't show you the full picture of why. The <a href="/scanner">Queldrex AI Visibility Scanner</a> checks all 14 signals that determine your AI presence - schema, robots.txt, citation consistency, content depth, crawlability, and more - and gives you a scored report with prioritized fixes. Run it free at queldrex.com/scanner.</p>
    `.trim(),
  },
  {
    slug: 'ai-seo-vs-traditional-seo',
    title: 'AI SEO vs Traditional SEO: What Changed and What Still Matters',
    description: "Google SEO and AI search optimization share some DNA - but the signals that matter are very different. Here's what you need to know to rank in both.",
    date: '2026-06-18',
    readTime: 7,
    category: 'Strategy',
    content: `
<h2>Two Search Paradigms, One Website</h2>
<p>For the past two decades, SEO meant one thing: get your pages to rank on Google. You optimized for keywords, built backlinks, improved Core Web Vitals, and wrote content designed to win a spot in Google's top ten results. The playbook was well understood, even if execution was hard.</p>
<p>Now you're optimizing for two fundamentally different systems simultaneously. Google still drives a huge portion of web traffic. But AI search tools - ChatGPT, Perplexity, Google's AI Overviews, Microsoft Copilot, and others - are handling an increasingly large share of informational and local queries. And they don't work the same way.</p>
<p>The good news: you don't have to rebuild everything. Some of what you've already done for Google carries over. The bad news: the signals that AI systems weight most heavily are often the ones traditional SEO advice neglected.</p>

<h2>What Traditional SEO Optimizes For</h2>
<p>Traditional SEO is built on Google's PageRank model. The core idea: a page that many trusted other pages link to is probably high quality. Add keyword relevance, content depth, technical performance, and user engagement signals, and you have the broad strokes of how Google has ranked content for years.</p>
<p>Key traditional SEO signals:</p>
<ul>
  <li><strong>Keyword optimization</strong> - matching user search queries to page content</li>
  <li><strong>Backlink authority</strong> - links from trusted domains signal your page's credibility</li>
  <li><strong>Core Web Vitals</strong> - page speed, layout stability, interactivity</li>
  <li><strong>Meta tags</strong> - title tags and meta descriptions that match search intent</li>
  <li><strong>Content length and depth</strong> - comprehensive coverage of a topic</li>
  <li><strong>On-page structure</strong> - H1/H2/H3 hierarchy, internal linking</li>
</ul>

<h2>What AI Search Optimizes For</h2>
<p>AI search systems don't rank pages - they synthesize answers. When someone asks ChatGPT a question, ChatGPT isn't giving them a list of URLs ordered by relevance. It's constructing a response based on what it knows, sourcing from training data and (when available) real-time web access. The businesses and content that get cited are ones the AI system has learned to trust as authoritative, accurate, and well-structured.</p>
<p>Key AI search signals:</p>
<ul>
  <li><strong>Entity recognition</strong> - is your business clearly identified as a distinct, trustworthy entity?</li>
  <li><strong>Structured data (schema markup)</strong> - machine-readable information about your business, products, and content</li>
  <li><strong>Citation consistency</strong> - your NAP (Name, Address, Phone) matching across dozens of sources</li>
  <li><strong>Crawlability by AI bots</strong> - GPTBot, PerplexityBot, ClaudeBot explicitly allowed in robots.txt</li>
  <li><strong>Topical authority</strong> - depth of content establishing genuine expertise on your core subjects</li>
  <li><strong>Factual accuracy</strong> - information that can be corroborated across multiple sources</li>
</ul>

<h2>Head-to-Head: Key Differences</h2>
<ul>
  <li><strong>Keywords vs. Entity mentions</strong> - Traditional SEO is keyword-centric. AI SEO is entity-centric. AI systems understand concepts and entities, not just strings of text. Being clearly identified as a business entity (via schema, consistent citations, and structured content) matters more than keyword density.</li>
  <li><strong>Backlinks vs. Citation consistency</strong> - Backlinks signal authority to Google. To AI systems, citation consistency across directories and trusted sources signals reliability. 50 consistent directory listings often does more for AI visibility than 50 backlinks.</li>
  <li><strong>Meta descriptions vs. Schema markup</strong> - Meta descriptions help Google understand what your page is about in a human-readable format. Schema markup does the same for AI systems in machine-readable JSON-LD. Both matter, but for different audiences.</li>
  <li><strong>Page speed vs. AI crawlability</strong> - Google cares deeply about your Core Web Vitals. AI systems care about whether their crawlers can access your content at all. A blazing-fast website that blocks GPTBot is invisible to ChatGPT.</li>
  <li><strong>Keyword volume vs. Topical authority</strong> - Traditional SEO targets high-volume keywords. AI SEO rewards comprehensive expertise on a topic cluster. Depth and breadth of coverage in your domain signals the kind of authority that gets you recommended.</li>
</ul>

<h2>What Still Matters for Both</h2>
<p>The good news is that the fundamentals of quality content haven't changed. Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) framework overlaps significantly with what AI systems look for when deciding who to recommend.</p>
<ul>
  <li><strong>Content quality</strong> - Genuinely useful, accurate, well-organized content serves both Google and AI systems</li>
  <li><strong>Author expertise signals</strong> - About pages, author bios, credentials, and real business information help both</li>
  <li><strong>Site structure</strong> - Clear navigation and internal linking help both Google and AI crawlers understand your content</li>
  <li><strong>HTTPS and security</strong> - Trusted secure connections matter to both</li>
  <li><strong>Mobile responsiveness</strong> - Still expected by Google; also ensures AI web access works cleanly</li>
</ul>

<h2>The New File: llms.txt</h2>
<p>A new standard is emerging specifically for AI optimization: <code>llms.txt</code>. Think of it like <code>robots.txt</code>, but designed to help AI systems understand your site's structure, purpose, and most important content.</p>
<p>While <code>robots.txt</code> controls which bots can crawl which pages, <code>llms.txt</code> gives AI systems a curated guide to your site - your most important pages, your areas of expertise, your business context. It's a simple text file placed at <code>yourdomain.com/llms.txt</code>.</p>
<p>The standard is still evolving, but early adoption is low-cost and signals to AI systems that you're optimized for them - much like adding a sitemap.xml signaled to early search engines that you wanted to be indexed.</p>

<h2>Optimizing for Both Without Doubling Your Work</h2>
<p>The key insight is that AI SEO and traditional SEO aren't in conflict - they're additive. The work you've already done for Google (quality content, clean site structure, technical performance) is foundational. What you're adding for AI is a layer of structure and consistency that Google largely figured out how to infer, but that AI systems need explicitly spelled out.</p>
<p>Start with the highest-impact additions that cost the least effort: add <code>LocalBusiness</code> schema to your homepage, audit your robots.txt to allow AI crawlers, claim and complete your Google Business Profile, and do a quick audit of your top directory listings. These four steps address the most common AI visibility gaps and apply to virtually every local and SMB website.</p>
<p>The <a href="/scanner">Queldrex AI Visibility Scanner</a> checks all 14 signals - traditional SEO fundamentals and AI-specific signals alike - and shows you exactly which gaps need filling. It's the fastest way to understand where you stand in both search paradigms.</p>
    `.trim(),
  },
  {
    slug: 'how-to-improve-ai-visibility',
    title: "How to Improve Your Business's AI Visibility: A Step-by-Step Guide",
    description: 'A practical, no-fluff guide to making your business more visible to ChatGPT, Perplexity, and other AI search engines. Covers schema markup, citations, content strategy, and more.',
    date: '2026-06-17',
    readTime: 8,
    category: 'How-To',
    content: `
<h2>Where to Start</h2>
<p>Improving your AI visibility doesn't require a complete website rebuild or a six-month content campaign. Most businesses can move the needle significantly in a single focused week by addressing the most common gaps. This guide walks through 10 steps in priority order - the highest-impact fixes first, the longer-term investments last.</p>

<h2>Step 1: Audit Your Current AI Visibility</h2>
<p>Before you fix anything, understand where you actually stand. Run your site through the <a href="/scanner">Queldrex AI Visibility Scanner</a> - it checks 14 signals in about 60 seconds and gives you a scored breakdown: what's passing, what's failing, and what to fix first. Start here so you're not guessing.</p>
<p>While you wait for the scan results, also manually test in ChatGPT: search for your business by name, and search for your service category in your city. Screenshot what you see. This is your baseline.</p>

<h2>Step 2: Fix Your robots.txt - Allow AI Crawlers</h2>
<p>This is the single most impactful technical fix and takes about five minutes. Go to <code>yourdomain.com/robots.txt</code> and check what's there.</p>
<p>You need to explicitly allow the major AI crawlers. Add these rules if they're not present:</p>
<ul>
  <li><code>User-agent: GPTBot</code> / <code>Allow: /</code> - OpenAI (ChatGPT)</li>
  <li><code>User-agent: PerplexityBot</code> / <code>Allow: /</code> - Perplexity</li>
  <li><code>User-agent: ClaudeBot</code> / <code>Allow: /</code> - Anthropic</li>
  <li><code>User-agent: Googlebot</code> / <code>Allow: /</code> - Google AI Overviews</li>
</ul>
<p>If your robots.txt has a blanket <code>Disallow: /</code> rule, you need to restructure it to allow legitimate crawlers while blocking the ones you actually want to block (scrapers, bad actors). Your web developer can handle this in minutes.</p>

<h2>Step 3: Add LocalBusiness Schema Markup to Your Homepage</h2>
<p>Schema markup is the machine-readable layer that tells AI systems exactly who you are. Without it, they're guessing. Add a <code>LocalBusiness</code> JSON-LD block to your homepage's <code>&lt;head&gt;</code> tag.</p>
<p>At minimum, your schema should include: <code>@type</code> (your specific business type - "Plumber", "Restaurant", "LawFirm", etc.), <code>name</code>, <code>url</code>, <code>telephone</code>, <code>address</code> (with <code>streetAddress</code>, <code>addressLocality</code>, <code>addressRegion</code>, <code>postalCode</code>), <code>openingHours</code>, <code>description</code>, and if you have them, <code>aggregateRating</code>.</p>
<p>Google's Rich Results Test (search.google.com/test/rich-results) lets you verify your schema is valid before you deploy it.</p>

<h2>Step 4: Create or Claim Your Google Business Profile</h2>
<p>Google Business Profile is one of the primary data sources AI systems use for local business information. An unclaimed or incomplete profile means you're either invisible or represented with outdated information.</p>
<p>Go to business.google.com and claim your listing. Fill out every field: business name, category, address, phone, hours, website, service area, photos, and the services you offer. The more complete your profile, the more confidently AI systems can recommend you. This takes about 30 minutes the first time.</p>

<h2>Step 5: Get Listed in the Top Directories</h2>
<p>AI models were trained on web data - and web data includes business directories. Your consistent presence across these sources signals reliability. Prioritize these 15:</p>
<ul>
  <li>Yelp (yelp.com/biz)</li>
  <li>Better Business Bureau (bbb.org)</li>
  <li>Angi (angi.com)</li>
  <li>HomeAdvisor (homeadvisor.com) - same parent as Angi</li>
  <li>Manta (manta.com)</li>
  <li>Foursquare (foursquare.com)</li>
  <li>Thumbtack (thumbtack.com)</li>
  <li>Nextdoor (nextdoor.com)</li>
  <li>Apple Maps (mapsconnect.apple.com)</li>
  <li>Bing Places (bingplaces.com)</li>
  <li>Yellow Pages (yellowpages.com)</li>
  <li>Houzz (houzz.com) - for home services</li>
  <li>Clutch (clutch.co) - for B2B services</li>
  <li>Chamber of Commerce (chamberofcommerce.com)</li>
  <li>Local city/county business directory</li>
</ul>
<p><strong>Critical:</strong> Your business Name, Address, and Phone number must be <em>identical</em> across every listing. Not "similar" - identical. Even small discrepancies (St. vs Street, Suite vs Ste) create inconsistency signals that hurt your AI visibility.</p>

<h2>Step 6: Write an Authoritative About Page</h2>
<p>Your About page is where AI systems go to understand who you are. A thin "We've been serving Denver since 2010" paragraph doesn't give them much to work with. A strong About page for AI visibility includes:</p>
<ul>
  <li>Your specific expertise and credentials</li>
  <li>Your team (names, roles, relevant background)</li>
  <li>Your service area with specific cities/neighborhoods</li>
  <li>Why your approach is different</li>
  <li>Any awards, certifications, or notable projects</li>
  <li>Your history and founding story</li>
</ul>
<p>Write it in clear, specific language. AI systems extract facts from text - the more concrete facts you give them, the more accurately they can represent your business.</p>

<h2>Step 7: Add FAQ Structured Data to Your Key Pages</h2>
<p>FAQ schema is one of the highest-ROI schema types for AI visibility. When you add FAQ structured data to your service pages, you're feeding AI systems the exact questions customers ask about your business - and your authoritative answers.</p>
<p>Think about what customers ask before hiring you: "How much does [service] cost?", "How long does it take?", "Are you licensed and insured?", "Do you serve [specific area]?". Each of these becomes a JSON-LD FAQ entry. AI systems use these directly when answering similar questions from users.</p>

<h2>Step 8: Create Content That Answers What Your Customers Ask AI</h2>
<p>Think about the questions your ideal customer asks ChatGPT or Perplexity before they're ready to buy. Then answer those questions better than anyone else.</p>
<p>For a roofing company in Phoenix: "How much does a roof replacement cost in Phoenix?", "What are signs I need a new roof?", "What roofing materials work best in Arizona heat?". Each of these is a blog post or service page section - and each one establishes your topical authority in a way AI systems can recognize and cite.</p>
<p>The bar isn't quantity. It's genuine usefulness. One comprehensive, accurate, well-organized article that actually answers the question will outperform five thin content pieces every time.</p>

<h2>Step 9: Build a Topical Authority Hub</h2>
<p>Once you have a few strong content pieces, link them together into a hub. A roofing company might have a main "Roofing Services" page that links to "Roof Replacement", "Roof Repair", "Gutters", "Storm Damage", and "Emergency Roof Repair" - with each of those pages cross-linking to the others and to the hub.</p>
<p>This structure signals to AI systems that you have deep, organized expertise on a topic - not just a single article. It's the difference between being recognized as a roofing authority and being recognized as someone who wrote one article about roofing once.</p>

<h2>Step 10: Monitor Monthly - AI Rankings Change</h2>
<p>AI systems update their training data, change their recommendation logic, and evolve how they handle real-time search. Your AI visibility score today is not your score in six months. New competitors enter the market, directories update their data, and the AI landscape itself shifts.</p>
<p>The <a href="/monitor">Queldrex AI Visibility Monitor</a> rescans your site monthly and tracks your score over time, alerting you to drops and showing you what changed. For $79/month, you get a continuous picture of your AI presence instead of a one-time snapshot - so you can catch problems before they cost you customers.</p>

<h2>The Compound Effect</h2>
<p>Each of these steps individually moves the needle. Together, they create a compounding effect: your schema makes it easier for AI to identify you, your citations confirm your identity across sources, your content establishes your expertise, and your monitoring ensures you stay ahead of changes. A business that does all ten of these steps well will consistently outrank competitors in AI search - and that advantage grows over time as the gap between optimized and unoptimized businesses widens.</p>
    `.trim(),
  },
  {
    slug: 'chatgpt-recommends-businesses',
    title: 'How ChatGPT Decides Which Businesses to Recommend',
    description: "ChatGPT doesn't just search Google when recommending businesses. It uses training data, real-time search, and structured signals. Here's exactly how it works.",
    date: '2026-06-16',
    readTime: 6,
    category: 'Deep Dive',
    content: `
<h2>The Black Box Isn't As Black As You Think</h2>
<p>When ChatGPT recommends a business, it feels like magic - or like something completely opaque. In reality, the system follows patterns that are predictable enough to optimize for. Understanding how it works is the first step to making sure your business shows up.</p>

<h2>ChatGPT's Two Modes: Training Data and Real-Time Search</h2>
<p>ChatGPT operates in two fundamentally different modes depending on whether web search is enabled:</p>

<h3>Mode 1: Training Data Only</h3>
<p>Without real-time search, ChatGPT answers questions based entirely on its training data - a massive snapshot of text from the web, books, and other sources, frozen at a cutoff date. When you ask it to recommend a local business without search enabled, it draws on whatever information about that business category and location appeared frequently in its training corpus.</p>
<p>Businesses that appeared consistently in high-quality, trustworthy sources before that cutoff have an inherent advantage. News mentions, review site appearances, directory listings, industry publications - these all contributed to what ChatGPT "knows" about your business.</p>

<h3>Mode 2: Real-Time Search (Bing Integration)</h3>
<p>When real-time search is enabled (the default in ChatGPT Plus and increasingly in free tiers), ChatGPT queries Bing for current information before formulating its response. This dramatically changes the picture for local businesses: what Bing can find about you right now matters as much as your historical training data presence.</p>
<p>Bing's web index crawls your site, reads your structured data, and surfaces your directory listings. If GPTBot and other AI crawlers are blocked from your site, Bing's real-time search still works - but it's working with whatever Bing has already indexed, which may be outdated or incomplete.</p>

<h2>How Training Data Affects Recommendations</h2>
<p>Not all sources in ChatGPT's training data were treated equally. The model learned to weight information from high-authority sources more heavily. A mention in a major local newspaper, an appearance in a Yelp "Best Of" roundup, consistent citations in multiple business directories - these all contributed to the model's confidence in recommending a business.</p>
<p>This is why businesses that have been active online for years, maintaining consistent directory listings and generating occasional press mentions, often show up in ChatGPT recommendations without having done any specific AI optimization. They've been accumulating training data presence passively.</p>
<p>Newer businesses - or businesses that kept a low profile online - face a steeper hill. Their training data presence is thin, which means they need to work harder on the real-time signals that ChatGPT can access through Bing and its own crawler.</p>

<h2>The Role of Structured Data</h2>
<p>When ChatGPT's crawler (GPTBot) or Bing accesses your website, structured data is one of the first things it processes. Schema markup in JSON-LD format tells the AI system exactly what your business is - your category, location, contact information, hours, and more - in a format that requires no inference.</p>
<p>Without structured data, the AI system has to parse your web content and make educated guesses about your business details. Sometimes it guesses right. Often it gets things slightly wrong - wrong hours, outdated phone numbers, imprecise service area. Sometimes it can't establish enough confidence to recommend you at all.</p>
<p>Adding a <code>LocalBusiness</code> schema block to your homepage is the single clearest signal you can send to AI systems about who you are. It takes about 20 minutes and has a direct, measurable impact on how accurately AI represents your business.</p>

<h2>Why Consistent NAP Matters More Than You'd Expect</h2>
<p>NAP - Name, Address, Phone - consistency across the web is a trust signal that AI systems treat the same way humans do. If your business appears on Yelp with one phone number, on Google Business Profile with a different number, and on your website with a third, that inconsistency signals unreliability.</p>
<p>AI systems encounter your business across dozens of sources when building their understanding of you. When those sources agree, confidence increases. When they conflict, confidence decreases - or the AI hedges by not recommending you at all when there's a cleaner alternative.</p>
<p>This is why citation audits are so important. It's not just about being listed; it's about every listing saying the same thing.</p>

<h2>Review Signals: Star Ratings and Volume Count</h2>
<p>When ChatGPT has access to real-time search, it can see your review scores on Google, Yelp, and other platforms. A business with 4.8 stars and 200 reviews is easier to recommend confidently than a business with 3.2 stars or no reviews at all.</p>
<p>AI systems don't explicitly sort results by star rating, but review data contributes to the overall picture of your business quality and customer satisfaction. More importantly, high review volume means your business appears more frequently in web content - more mentions, more data points, more training signal.</p>
<p>Actively generating reviews is an AI visibility strategy, not just a reputation management strategy.</p>

<h2>The Authority Heuristic: Appearing in Multiple Trusted Sources</h2>
<p>Perhaps the most important thing to understand about how ChatGPT decides what to recommend is this: <strong>it trusts businesses that appear in multiple reputable sources.</strong></p>
<p>When AI systems encounter a business name across a local news article, a Yelp listing, a Google Business Profile, a BBB listing, a Chamber of Commerce entry, and an industry directory - all saying consistent things - that convergence of signals creates strong recommendation confidence.</p>
<p>When a business exists only on its own website, with minimal external citations and no structured data, AI systems have to make a judgment call about whether to include it. Usually they don't - because there's always a better-evidenced alternative available.</p>
<p>This is the core insight behind AI visibility optimization: you're not trying to trick an algorithm. You're building the kind of authoritative, consistent, well-documented online presence that any reasonable system - human or AI - would recognize as trustworthy.</p>

<h2>What You Can Do Starting Today</h2>
<ul>
  <li><strong>Run a scan</strong> - <a href="/scanner">queldrex.com/scanner</a> shows you your current AI visibility score across 14 signals</li>
  <li><strong>Allow AI crawlers</strong> - update your robots.txt to allow GPTBot, PerplexityBot, and ClaudeBot</li>
  <li><strong>Add schema markup</strong> - LocalBusiness JSON-LD on your homepage</li>
  <li><strong>Audit your top 5 directory listings</strong> - make sure your NAP is identical everywhere</li>
  <li><strong>Set up monitoring</strong> - <a href="/monitor">queldrex.com/monitor</a> tracks your AI visibility score monthly so you catch drops before they cost you customers</li>
</ul>
<p>AI search isn't replacing your entire customer funnel tomorrow. But it's already handling enough queries that the businesses not showing up in it are leaving real money on the table. The window to get ahead of this before it becomes table stakes is right now.</p>
    `.trim(),
  },
  {
    slug: 'how-to-check-dns-records',
    title: 'How to Check DNS Records Online (And What Each One Means)',
    description: 'DNS records control your email, website, and security. Here is what each record type does, why you would need to check them, and how to read the results.',
    date: '2026-06-21',
    readTime: 6,
    category: 'How-To',
    content: `
<h2>Why DNS Records Matter</h2>
<p>Every time someone visits your website, sends you an email, or checks if your domain is legitimate, DNS records are what make it work. They are the phone book of the internet - a set of instructions that tell browsers, mail servers, and other systems where to find you and how to communicate with you.</p>
<p>Most of the time DNS just works. You notice it when it breaks: email stops arriving, a new domain takes days to resolve, or a security scanner flags a missing record that is exposing your domain to spoofing. Knowing how to check your DNS records is a basic skill for anyone running a website or managing a domain.</p>

<h2>When You Need to Check DNS Records</h2>
<ul>
  <li><strong>After a migration</strong> - Moving to a new host or mail provider means updating DNS records. You need to verify the new records propagated correctly and the old ones were removed.</li>
  <li><strong>Email deliverability problems</strong> - Missing or misconfigured SPF, DKIM, or DMARC records are the most common cause of email going to spam. A DNS check reveals the problem in seconds.</li>
  <li><strong>New domain setup</strong> - A fresh domain has no records by default. You need to add A records for your website, MX records for email, and TXT records for verification and security.</li>
  <li><strong>Security audit</strong> - An attacker who can spoof your domain can impersonate your company in email. Checking your DNS reveals whether your defenses are in place.</li>
  <li><strong>Propagation verification</strong> - DNS changes can take up to 48 hours to spread worldwide. Checking from multiple resolvers tells you if a change has propagated.</li>
</ul>

<h2>What Each DNS Record Type Does</h2>

<h3>A Record</h3>
<p>Maps your domain to an IPv4 address. When someone visits <code>example.com</code>, the A record tells their browser which server to connect to. If your A record points to the wrong IP, your site goes down. This is the most basic DNS record.</p>

<h3>AAAA Record</h3>
<p>Same as an A record but for IPv6 addresses. Most modern hosting setups support both IPv4 and IPv6. If your host provides an IPv6 address, add an AAAA record alongside your A record.</p>

<h3>MX Record</h3>
<p>Mail Exchange record - tells other mail servers where to deliver email for your domain. If you use Google Workspace, your MX records point to Google's mail servers. Missing or wrong MX records mean email sent to you bounces or disappears.</p>

<h3>TXT Record</h3>
<p>A catch-all record type for text-based information. Used for SPF records (email authentication), domain ownership verification (Google Search Console, Stripe, etc.), and DKIM public keys. If something requires you to "add a TXT record to verify ownership," this is where it goes.</p>

<h3>CNAME Record</h3>
<p>Canonical Name record - an alias that points one domain name to another. Commonly used for subdomains: <code>www.example.com</code> pointing to <code>example.com</code>, or <code>shop.example.com</code> pointing to a Shopify or other ecommerce domain.</p>

<h3>NS Record</h3>
<p>Name Server record - identifies which DNS servers are authoritative for your domain. When you register a domain and point it to Cloudflare, AWS Route 53, or another DNS provider, you change the NS records. If these are wrong, nothing else about your DNS will work.</p>

<h3>CAA Record</h3>
<p>Certification Authority Authorization - specifies which certificate authorities (CAs) are allowed to issue SSL certificates for your domain. Without a CAA record, any CA can issue a cert. Adding one is a security measure that prevents unauthorized certificate issuance.</p>

<h3>DMARC Record</h3>
<p>Domain-based Message Authentication, Reporting and Conformance - a policy record stored as a TXT record at <code>_dmarc.yourdomain.com</code>. It tells receiving mail servers what to do if an email fails SPF or DKIM checks. A missing DMARC record means your domain can be spoofed without any enforcement action.</p>

<h2>How to Check DNS Records</h2>
<p>The fastest way is to use a real-time DNS lookup tool. The <a href="/tools/dns-health">Queldrex DNS Health Checker</a> queries both Cloudflare (1.1.1.1) and Google (8.8.8.8) resolvers simultaneously - which lets you spot propagation differences between providers. It checks A, MX, NS, TXT, CAA, DMARC, SPF, and DKIM records in one pass and flags anything missing or misconfigured.</p>
<p>If you prefer the command line, <code>dig</code> works on Mac and Linux: <code>dig MX yourdomain.com</code> returns your MX records. <code>nslookup</code> is the Windows equivalent. These tools query a single resolver and show raw output - useful for debugging but less convenient than a visual tool that checks multiple record types at once.</p>

<h2>Reading Propagation Status</h2>
<p>DNS changes do not take effect instantly. Your registrar pushes the change, but the TTL (Time To Live) on your existing records determines how long other DNS servers cache the old value. A TTL of 3600 means cached servers hold the old record for up to an hour. During a migration, temporarily lowering your TTL to 300 seconds before making changes reduces propagation time significantly.</p>
<p>If you check your records from two different tools and get different results, you are seeing a propagation difference - some resolvers have the new record, others are still serving the old cached value. This is normal and usually resolves within a few hours.</p>
    `.trim(),
  },
  {
    slug: 'spf-dkim-dmarc-explained',
    title: 'SPF, DKIM, and DMARC Explained - Why Your Emails Go to Spam',
    description: 'Three DNS records stand between your emails and the spam folder. Here is what SPF, DKIM, and DMARC each do, how they work together, and how to check if yours are configured correctly.',
    date: '2026-06-21',
    readTime: 7,
    category: 'Guide',
    content: `
<h2>The Three Records That Control Your Email Reputation</h2>
<p>If your legitimate business emails are landing in spam, or if someone is spoofing your domain to send phishing emails, the root cause is almost always a missing or misconfigured SPF, DKIM, or DMARC record. These three DNS records form a chain of email authentication that receiving mail servers use to decide whether to trust email that claims to come from your domain.</p>
<p>Understanding what each one does - and what the different values actually mean - is practical knowledge for anyone who runs a business with a custom domain.</p>

<h2>SPF - Who Is Allowed to Send Email From Your Domain</h2>
<p>SPF (Sender Policy Framework) is a TXT record that lists the mail servers authorized to send email on behalf of your domain. When a mail server receives an email claiming to be from <code>you@yourcompany.com</code>, it looks up your domain's SPF record and checks: is the sending server on the approved list?</p>
<p>A basic SPF record looks like this: <code>v=spf1 include:_spf.google.com ~all</code>. Breaking this down:</p>
<ul>
  <li><code>v=spf1</code> - identifies this as an SPF record</li>
  <li><code>include:_spf.google.com</code> - authorizes Google's mail servers (for Google Workspace users)</li>
  <li><code>~all</code> - the "all" mechanism defines what to do with email from servers not on the list</li>
</ul>
<p>The "all" qualifier is where many people get confused:</p>
<ul>
  <li><code>-all</code> - hard fail: reject email from unauthorized servers. The strictest option.</li>
  <li><code>~all</code> - soft fail: accept but mark suspicious email. The most common setting.</li>
  <li><code>?all</code> - neutral: no policy. Provides no protection and is effectively useless.</li>
  <li><code>+all</code> - pass everything. Never use this - it authorizes anyone to send as you.</li>
</ul>
<p>If you send email from multiple services (your mail host, plus a CRM, plus a transactional email provider like SendGrid or Postmark), each needs to be included in your SPF record. A common mistake is adding a new service and forgetting to update SPF - emails from that service then fail authentication.</p>

<h2>DKIM - Cryptographic Proof That Email Wasn't Tampered With</h2>
<p>DKIM (DomainKeys Identified Mail) uses a public/private key pair to sign outgoing emails. Your mail server signs each outgoing email with a private key. The receiving mail server looks up your public key (stored as a TXT record in your DNS) and verifies the signature. If the email was altered in transit - even by a single character - the signature fails.</p>
<p>You will not write a DKIM record by hand. Your email provider generates the key pair and gives you a TXT record to add to your DNS. For Google Workspace, you go to the Admin Console, generate a key, and add the resulting TXT record at a subdomain like <code>google._domainkey.yourdomain.com</code>.</p>
<p>DKIM does two things: it proves the email came from your domain's mail infrastructure, and it proves the email content was not modified after it was sent. This is why DKIM is important even if SPF is passing - a spammer who routes email through your server would pass SPF but fail DKIM.</p>

<h2>DMARC - The Policy That Ties It Together</h2>
<p>DMARC (Domain-based Message Authentication, Reporting and Conformance) is a policy record that tells receiving mail servers what to do when email fails SPF or DKIM - and asks them to report back to you about what they see.</p>
<p>A DMARC record lives at <code>_dmarc.yourdomain.com</code> as a TXT record. A typical record looks like: <code>v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=100</code></p>
<p>The <code>p=</code> tag is the policy:</p>
<ul>
  <li><code>p=none</code> - monitor only. Take no action on failures, just collect reports. Use this when you first set up DMARC to understand your email traffic before enforcing anything.</li>
  <li><code>p=quarantine</code> - send failing email to spam. Not rejected, but flagged. This is the most common production setting.</li>
  <li><code>p=reject</code> - reject failing email outright. The strictest option. Only use this once you are confident all your legitimate email is passing DMARC.</li>
</ul>
<p>The <code>rua=</code> tag specifies where aggregate reports should be sent. These reports show you which servers are sending email that claims to be from your domain - which is how you discover if someone is spoofing you.</p>

<h2>How They Work Together</h2>
<p>For DMARC to pass, the email needs to pass either SPF or DKIM - and the domain in the From header needs to align with the domain that passed. This alignment requirement is what makes DMARC actually effective at preventing spoofing, rather than just checking individual records in isolation.</p>
<p>A common failure scenario: a company sets up SPF and DKIM for their primary mail server but not for their marketing email platform. The marketing emails pass through the platform's servers, the SPF record for the platform is not in the company's DNS, and DMARC fails - even though the emails are legitimate. This is why checking all your email sending sources is essential before moving DMARC to <code>p=reject</code>.</p>

<h2>How to Check If Your Records Are Correct</h2>
<p>The <a href="/tools/email-deliverability">Queldrex Email Deliverability Checker</a> looks up your SPF, DKIM, and DMARC records and flags anything missing or misconfigured. It checks whether your DMARC policy actually enforces anything (p=none does not), whether your SPF record has syntax errors, and whether DKIM records are present for common selectors. Enter your domain and you get a pass/fail breakdown in seconds.</p>
<p>If you find issues: SPF and DMARC are straightforward to add yourself through your DNS provider's dashboard. DKIM setup requires working with your email provider's admin console - Google Workspace, Microsoft 365, and most major email platforms have step-by-step guides for generating and deploying DKIM keys.</p>
    `.trim(),
  },
  {
    slug: 'free-nda-template-guide',
    title: 'Free NDA Template - What to Include and What to Watch Out For',
    description: 'A non-disclosure agreement does not need to be complicated or expensive. Here is what a solid NDA covers, the difference between mutual and one-way agreements, and what to watch out for before you sign.',
    date: '2026-06-21',
    readTime: 5,
    category: 'Guide',
    content: `
<p><em>Disclaimer: This article is for informational purposes only and is not legal advice. For specific legal questions, consult a licensed attorney in your jurisdiction.</em></p>

<h2>What an NDA Actually Protects</h2>
<p>A non-disclosure agreement (NDA) is a contract between two parties that defines what information is confidential, who can access it, and what happens if it is disclosed. It creates a legal obligation - but more practically, it signals that both parties take confidentiality seriously and establishes a clear paper trail if something goes wrong.</p>
<p>What an NDA protects: trade secrets, business plans, client lists, pricing strategies, technical specifications, proprietary processes, and any other information one party defines as confidential.</p>
<p>What an NDA does not protect: information that is already public, information the other party knew before the agreement, information they independently develop, or information they receive from a third party without restriction. These are called carve-outs, and every NDA has them - because it would be unreasonable to prohibit someone from discussing something that is already publicly known.</p>

<h2>Mutual vs. One-Way NDAs</h2>
<p>The first decision when drafting an NDA is whether it needs to be mutual or one-way.</p>
<p>A <strong>one-way (unilateral) NDA</strong> protects information flowing in one direction. If you are sharing your business plan with a potential investor, or sharing technical specs with a contractor, the information flows from you to them - and only your information needs protection. Use a one-way NDA when only one party is disclosing confidential information.</p>
<p>A <strong>mutual (bilateral) NDA</strong> protects information flowing in both directions. If you are in a partnership discussion where both parties will share sensitive information, a mutual NDA makes sense. It treats both parties symmetrically and is common in business development conversations, M&A discussions, and joint ventures.</p>
<p>In practice, contractors and freelancers are often asked to sign one-way NDAs by clients who do not want to be bound by the same restrictions themselves. This is reasonable. Read carefully before signing - know which direction the confidentiality obligations run.</p>

<h2>Key Clauses Every NDA Should Have</h2>

<h3>Definition of Confidential Information</h3>
<p>The agreement should clearly define what counts as confidential. Overly broad definitions ("all information shared verbally or in writing") create ambiguity and are harder to enforce. Good practice is to define categories of information and require the disclosing party to mark written materials as "Confidential" or confirm verbal disclosures in writing within a reasonable time.</p>

<h3>Term</h3>
<p>The term is how long the agreement is in effect. There are two types: the duration of the agreement itself (often 2-5 years) and the confidentiality obligation period (which may extend beyond when the agreement ends). Perpetual confidentiality obligations - ones with no end date - are often unenforceable in many jurisdictions because courts consider them an unreasonable restraint. A specific term of 2-5 years is more defensible.</p>

<h3>Governing Law and Jurisdiction</h3>
<p>This clause specifies which state's laws apply and where disputes will be resolved. For freelancers, this matters - if a client in California wants California law to govern a contract with a developer in Texas, you may be agreeing to litigate in a state where you do not live. Negotiate this clause if the jurisdiction is inconvenient or unfavorable.</p>

<h3>Permitted Disclosures</h3>
<p>Every NDA should allow disclosure when required by law (a court order, for example), and usually to advisors (lawyers, accountants) who are bound by their own confidentiality obligations. Without this clause, the agreement could theoretically require you to violate a subpoena to avoid breaching the NDA - which no court would enforce anyway, but which creates unnecessary ambiguity.</p>

<h3>Remedies</h3>
<p>The remedies clause says what the non-breaching party can seek if the NDA is violated. Injunctive relief (asking a court to stop the disclosure) is typically included because money damages are hard to calculate for information leaks. Many NDAs also specify that breach entitles the harmed party to attorneys' fees - which creates a real financial deterrent.</p>

<h2>Generate a Solid NDA in Under a Minute</h2>
<p>The <a href="/tools/nda-generator">Queldrex NDA Generator</a> creates a complete mutual or one-way NDA based on your inputs - governing law, term, effective date, and party names. The output is a clean, properly structured document you can download as a PDF, review with counsel, and send for signature. It is a starting point, not a substitute for legal advice, but for many straightforward freelance and business development situations it gets you 90% of the way there in under 60 seconds.</p>
<p>For high-stakes agreements - a major partnership, an acquisition, employment agreements with senior staff - have an attorney review the final document. For routine contractor and vendor situations, a well-structured template covers the essential bases.</p>
    `.trim(),
  },
  {
    slug: 'how-to-check-npm-vulnerabilities',
    title: 'How to Check npm Packages for Security Vulnerabilities',
    description: 'npm audit misses things. Here is how CVE databases actually work, what CVSS scores mean, and the fastest way to find and fix vulnerable dependencies before they become a problem.',
    date: '2026-06-21',
    readTime: 6,
    category: 'How-To',
    content: `
<h2>Why npm audit Is Not Enough</h2>
<p>Most developers know about <code>npm audit</code>. You run it, it tells you about vulnerabilities, you feel like you have done your due diligence. The problem is that <code>npm audit</code> only checks the npm advisory database - a subset of the full vulnerability landscape. It misses vulnerabilities reported in other databases and does not check Python dependencies at all if you have a mixed project.</p>
<p>More importantly, <code>npm audit</code> gives you a number (usually alarming) without much context about which vulnerabilities actually matter in your specific usage. A critical vulnerability in a package you use only in tests is very different from a critical vulnerability in a package that handles user input in production.</p>

<h2>How CVE Databases Work</h2>
<p>A CVE (Common Vulnerability and Exposures) is a unique identifier assigned to a publicly known security vulnerability. CVE-2021-44228 is Log4Shell. CVE-2019-10744 is the lodash prototype pollution vulnerability. The CVE ID is the universal reference - you can search it in any security database and get consistent information.</p>
<p>MITRE Corporation assigns CVE IDs. The National Vulnerability Database (NVD) scores them using CVSS. The GitHub Security Advisory database tracks vulnerabilities in open source packages specifically. Google's OSV (Open Source Vulnerability) database aggregates all of these - NVD, GitHub Security Advisories, PyPI advisories, and more - into a single normalized format.</p>
<p>The OSV database is what powers GitHub's Dependabot and the <code>npm audit</code> command. It is also what the <a href="/tools/dep-scanner">Queldrex Dependency CVE Scanner</a> queries directly - which means you get the same data that Dependabot uses, without needing to push your code to GitHub.</p>

<h2>What CVSS Scores Actually Mean</h2>
<p>CVSS (Common Vulnerability Scoring System) scores vulnerabilities from 0 to 10 based on how exploitable they are and what damage they can cause. The number tells you the severity tier:</p>
<ul>
  <li><strong>0.0 – 3.9 (Low)</strong> - Exploitable but limited impact. Usually requires unusual conditions or significant attacker effort. Fix it, but not urgently.</li>
  <li><strong>4.0 – 6.9 (Medium)</strong> - Exploitable under specific conditions. May require local access or a particular configuration. Should be fixed in a normal release cycle.</li>
  <li><strong>7.0 – 8.9 (High)</strong> - Serious. Remotely exploitable or with significant impact on confidentiality, integrity, or availability. Fix in your next release.</li>
  <li><strong>9.0 – 10.0 (Critical)</strong> - Remotely exploitable, no authentication required, full compromise possible. Log4Shell was a 10.0. Fix immediately - today if possible.</li>
</ul>
<p>The CVSS score is a baseline, not context-aware. A 9.0 vulnerability in a package you only use to generate test fixtures during CI - where the vulnerability requires user-controlled input to trigger - is practically zero risk in your environment. A 5.0 vulnerability in a package that parses untrusted user data in your API could be your biggest risk. Read the advisory, not just the number.</p>

<h2>The Fix Version Field</h2>
<p>Every vulnerability report includes a "fixed in version" field - the specific package version where the maintainers patched the issue. This is what you need to upgrade to. For most advisories, the fix is straightforward: run <code>npm update packagename</code> or pin the specific version in your package.json.</p>
<p>The complication: sometimes the fixed version is a major version bump with breaking changes. <code>lodash</code> 3.x to 4.x introduced breaking API changes, so upgrading is not always a drop-in. In those cases, check the advisory for workarounds - sometimes there is a way to neutralize the vulnerability without upgrading, or you can upgrade only the vulnerable code paths.</p>
<p>After upgrading, re-run your dependency scan to confirm the advisory no longer appears. Then re-run your tests. Then update your lockfile and commit the changes so everyone on the team gets the fixed versions.</p>

<h2>Scanning Without Pushing to GitHub</h2>
<p>If your project is private, or if you want to check before committing, you do not need Dependabot. The <a href="/tools/dep-scanner">Queldrex Dependency CVE Scanner</a> lets you paste your <code>package.json</code> or <code>requirements.txt</code> directly into a form and get a full vulnerability report from the OSV database - CVE IDs, CVSS scores, fix versions, and links to the full GitHub Security Advisories. No account required, no code leaves your clipboard.</p>
<p>It supports both npm (package.json) and Python (requirements.txt), which makes it useful for full-stack projects where both ecosystems are in play. Paste, scan, fix - no pipeline setup required.</p>

<h2>Building Dependency Scanning Into Your Workflow</h2>
<p>The best time to catch a vulnerable dependency is before it ships. A few practices that help:</p>
<ul>
  <li><strong>Scan before every major release</strong> - paste your current package.json and check for new advisories before you cut a release branch.</li>
  <li><strong>Enable Dependabot on GitHub</strong> - it creates automated PRs when new advisories appear for your dependencies.</li>
  <li><strong>Use exact versions in package.json</strong> - <code>"lodash": "4.17.21"</code> instead of <code>"^4.17.0"</code>. This prevents automatic upgrades that could introduce different vulnerabilities.</li>
  <li><strong>Review the advisory, not just the score</strong> - understand whether the vulnerable code path is reachable in your application before declaring an emergency.</li>
</ul>
    `.trim(),
  },
  {
    slug: 'how-to-check-ssl-certificate-expiry',
    title: 'How to Check Your SSL Certificate Expiry Date (And Set Up Alerts)',
    description: 'An expired SSL certificate takes your site offline with no warning. Here is how to check your expiry date, what the results mean, and how to make sure it never expires again.',
    date: '2026-06-21',
    readTime: 5,
    category: 'How-To',
    content: `
<h2>Why SSL Expiry Causes Hard Outages</h2>
<p>When an SSL certificate expires, browsers do not give visitors a warning and let them proceed - they show a hard error screen that most users will not bypass. Chrome displays "Your connection is not private." Firefox shows "Warning: Potential Security Risk Ahead." Both block the user from reaching the site by default. Your analytics drop to zero. Customers cannot check out. No degraded mode, no fallback - just a wall.</p>
<p>This happens to large companies regularly. Spotify, LinkedIn, and even Microsoft have had certificate expiry incidents. The cause is almost always the same: a certificate was manually provisioned, the renewal was someone's responsibility, and it fell through the cracks. The fix is removing the human from the loop.</p>

<h2>How to Check Your SSL Certificate Expiry</h2>

<h3>From a browser</h3>
<p>Click the padlock icon in your browser's address bar when visiting your site. In Chrome, click "Connection is secure" then "Certificate is valid." You will see the expiry date. This works but only shows you the certificate your browser negotiated - it may not show you certificates for subdomains, or details about the full chain.</p>

<h3>From the command line</h3>
<p>On Mac or Linux, <code>openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates</code> returns the <code>notAfter</code> date - your expiry. This works for any domain you can reach and does not require any special tools beyond openssl, which is installed by default on most systems.</p>

<h3>From a tool</h3>
<p>The <a href="/tools/ssl-inspector">Queldrex SSL Inspector</a> opens a real TLS handshake to your server - the same process a browser performs - and returns the full certificate details: expiry date, issuer, all domains on the certificate (Subject Alternative Names), the TLS version negotiated, and the cipher suite. It shows you exactly what a browser sees, not a cached or third-party-stored result. Enter your domain and get the full picture in a few seconds.</p>

<h2>What the Results Mean</h2>

<h3>Days until expiry</h3>
<p>If you have more than 60 days: you are fine, but set a calendar reminder.<br/>
30-60 days: time to renew. If you are on auto-renewal, verify it is actually configured.<br/>
Under 30 days: renew immediately. Do not wait for it to process over a weekend.<br/>
Expired: your site is broken for most users right now.</p>

<h3>TLS version</h3>
<p>TLS 1.3 is the current standard. TLS 1.2 works but is aging. TLS 1.0 and 1.1 are deprecated - modern browsers reject connections that only support these older versions. If your server is still offering TLS 1.0 or 1.1, this should be a configuration fix priority even if the cert itself is valid.</p>

<h3>Certificate chain</h3>
<p>SSL certificates are issued by a Certificate Authority (CA) that chains up to a root certificate your browser trusts. An incomplete chain - where an intermediate certificate is missing - causes errors on some devices even if the cert itself is valid. The SSL Inspector will flag this if detected.</p>

<h3>Subject Alternative Names</h3>
<p>Modern certificates cover multiple domains in a single cert using SANs. Make sure <code>www.yourdomain.com</code> and <code>yourdomain.com</code> are both covered. If you have subdomains with sensitive content (app, api, mail), they should have their own certs or be covered by a wildcard cert (<code>*.yourdomain.com</code>).</p>

<h2>Making Sure It Never Expires Again</h2>

<h3>Use Let's Encrypt with auto-renewal</h3>
<p>Let's Encrypt issues free 90-day certificates that auto-renew 60 days before expiry when configured correctly. Most hosting platforms - Vercel, Netlify, Cloudflare, DigitalOcean App Platform - handle this automatically. If your infrastructure supports certbot, configure it to run on a cron job: <code>0 0 * * * /usr/bin/certbot renew --quiet</code>.</p>

<h3>For managed hosting</h3>
<p>Vercel, Netlify, and Cloudflare all provision and auto-renew SSL certificates for custom domains automatically. If you are on one of these platforms and your cert expired, something is wrong with your domain DNS configuration - the cert cannot be reissued because the provider cannot verify domain ownership. Check your DNS records and make sure the domain is properly pointed.</p>

<h3>For commercial certs</h3>
<p>If you purchased a certificate from DigiCert, Comodo, or another commercial CA, renewal is manual by default. Most CAs send reminder emails at 60, 30, and 7 days before expiry. Make sure those emails go to a monitored inbox, not a shared alias where they get buried. Set a recurring calendar event one month before your cert's annual expiry date as a backup.</p>

<h3>Monitor it</h3>
<p>Even with auto-renewal configured, verify it works. After your next renewal, check that the new cert was actually issued and that the expiry date in the SSL Inspector is updated. Many developers set up auto-renewal and then discover months later that it silently failed due to a DNS change or permission issue. A monthly check takes 10 seconds and catches failures before they become outages.</p>
    `.trim(),
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug)
}

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date))
}
