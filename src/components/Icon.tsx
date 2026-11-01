import type { ReactNode } from 'react'

export type IconName =
  | 'sparkles' | 'arrow-right' | 'arrow-up-right' | 'search' | 'heart' | 'copy'
  | 'check' | 'shuffle' | 'lock' | 'unlock' | 'eye' | 'grid' | 'sliders'
  | 'chevron-down' | 'close' | 'moon' | 'sun' | 'download' | 'link'
  | 'code' | 'arrow-left' | 'check-circle' | 'layers' | 'contrast'
  | 'palette' | 'adjust' | 'refresh' | 'menu' | 'filter' | 'mouse'

const paths: Record<IconName, ReactNode> = {
  'sparkles': <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 18 .6 1.4L21 20l-1.4.6L19 22l-.6-1.4L17 20l1.4-.6L19 18ZM5 2l.6 1.4L7 4l-1.4.6L5 6l-.6-1.4L3 4l1.4-.6L5 2Z"/></>,
  'arrow-right': <><path d="M4 12h16"/><path d="m13 5 7 7-7 7"/></>,
  'arrow-up-right': <><path d="M5 19 19 5"/><path d="M8 5h11v11"/></>,
  'search': <><circle cx="10.8" cy="10.8" r="7.3"/><path d="m16.5 16.5 4 4"/></>,
  'heart': <path d="M20.8 8.6c0 4.6-8.8 10.8-8.8 10.8S3.2 13.2 3.2 8.6a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z"/>,
  'copy': <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  'check': <path d="m5 12 4 4L19 6"/>,
  'shuffle': <><path d="m17 3 4 4-4 4M3 17h3c5 0 5-10 11-10h4M17 21l4-4-4-4M3 7h3c2.5 0 4.1 2.7 5.2 5M14 16c.8.6 1.7 1 3 1h4"/></>,
  'lock': <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  'unlock': <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-1.9"/></>,
  'eye': <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
  'grid': <><rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/></>,
  'sliders': <><path d="M4 6h7m5 0h4M4 18h4m5 0h7"/><circle cx="13.5" cy="6" r="2.5"/><circle cx="10.5" cy="18" r="2.5"/></>,
  'chevron-down': <path d="m6 9 6 6 6-6"/>,
  'close': <path d="M5 5 19 19M19 5 5 19"/>,
  'moon': <path d="M20 15.9A8 8 0 0 1 8.1 4 8 8 0 1 0 20 15.9Z"/>,
  'sun': <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  'download': <><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 17v4h16v-4"/></>,
  'link': <><path d="M10 13.5a5 5 0 0 0 7.1 0l2.2-2.2a5 5 0 0 0-7.1-7.1L11 5.4"/><path d="M14 10.5a5 5 0 0 0-7.1 0l-2.2 2.2a5 5 0 0 0 7.1 7.1l1.2-1.2"/></>,
  'code': <><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></>,
  'arrow-left': <><path d="M20 12H4m7 7-7-7 7-7"/></>,
  'check-circle': <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
  'layers': <><path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/></>,
  'contrast': <><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z"/></>,
  'palette': <><path d="M12 3a9 9 0 1 0 0 18h1a2.5 2.5 0 0 0 1.7-4.3c-.9-1 0-2.7 1.6-2.7h1A4.8 4.8 0 0 0 22 9.3 9 9 0 0 0 12 3Z"/><circle cx="7" cy="10" r=".75"/><circle cx="11" cy="7" r=".75"/><circle cx="16" cy="8" r=".75"/><circle cx="7.5" cy="14.5" r=".75"/></>,
  'adjust': <><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/></>,
  'refresh': <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.7 8a7 7 0 0 1 12.2-1l1.1 5M4 12l1.1 5A7 7 0 0 0 17.3 16"/></>,
  'menu': <path d="M4 7h16M4 12h16M4 17h16"/>,
  'filter': <><path d="M4 6h16M7 12h10m-7 6h4"/></>,
  'mouse': <><rect x="7" y="2" width="10" height="20" rx="5"/><path d="M12 6v4"/></>,
}

interface Props {
  name: IconName
  size?: number
  className?: string
  fill?: string
}

export default function Icon({ name, size = 18, className, fill = 'none' }: Props) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>
}
