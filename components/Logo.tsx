import Image from 'next/image'

export default function QueldrexLogo({ size = 'md', center = false }: { size?: 'sm' | 'md' | 'lg', center?: boolean }) {
  const dims = { sm: [140, 56], md: [200, 80], lg: [240, 96] }[size]
  return (
    <span style={{
      display: center ? 'block' : 'inline-block',
      width: dims[0],
      height: dims[1],
      position: 'relative',
      flexShrink: 0,
      ...(center ? { margin: '0 auto' } : {}),
    }}>
      <Image
        src="/logo.png"
        alt="Queldrex"
        fill
        style={{ objectFit: 'contain', objectPosition: 'center', mixBlendMode: 'lighten' }}
        priority
      />
    </span>
  )
}
