import { Link } from 'react-router-dom'
import {
  TwitterIcon,
  FacebookIcon,
  InstagramIcon,
  GithubIcon,
} from './Icons'

const columns = [
  {
    title: 'Company',
    links: ['About', 'Features', 'Works', 'Career'],
  },
  {
    title: 'Help',
    links: ['Customer Support', 'Delivery Details', 'Terms & Conditions', 'Privacy Policy'],
  },
  {
    title: 'FAQ',
    links: ['Account', 'Manage Deliveries', 'Orders', 'Payments'],
  },
  {
    title: 'Resources',
    links: ['Free eBooks', 'Development Tutorial', 'How to - Blog', 'Youtube Playlist'],
  },
]

const socials = [TwitterIcon, FacebookIcon, InstagramIcon, GithubIcon]

const payments = [
  { label: 'Visa', src: 'visa' },
  { label: 'Mastercard', src: 'mastercard' },
  { label: 'PayPal', src: 'paypal' },
  { label: 'Apple Pay', src: 'applepay' },
  { label: 'Google Pay', src: 'gpay' },
]

function PaymentBadge({ label, src }) {
  const content = {
    visa: <span className="font-bold italic text-[#1A1F71] text-sm">VISA</span>,
    mastercard: (
      <span className="relative inline-flex">
        <span className="h-4 w-4 rounded-full bg-[#EB001B]" />
        <span className="-ml-2 h-4 w-4 rounded-full bg-[#F79E1B] opacity-90" />
      </span>
    ),
    paypal: <span className="text-sm font-bold"><span className="text-[#003087]">Pay</span><span className="text-[#009cde]">Pal</span></span>,
    applepay: <span className="inline-flex items-center text-sm font-semibold"><span className="mr-0.5"></span>Pay</span>,
    gpay: (
      <span className="inline-flex items-center whitespace-nowrap text-sm font-semibold text-[#5F6368]">
        <span className="font-bold text-[#4285F4]">G</span>
        <span className="ml-0.5">Pay</span>
      </span>
    ),
  }
  return (
    <div
      className="flex h-9 w-[54px] items-center justify-center rounded-md border border-black/10 bg-white px-2.5"
      aria-label={label}
    >
      {content[src]}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#F0F0F0] pt-[200px] sm:pt-[260px]">
      <div className="container-shop pb-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-6">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-display text-[33px] leading-none tracking-tight">
              SHOP.CO
            </Link>
            <p className="mt-6 max-w-[248px] text-sm leading-6 text-black/60">
              We have clothes that suits your style and which you're proud to wear. From women to men.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {socials.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                    i === 1
                      ? 'border-black bg-black text-white'
                      : 'border-black/20 bg-white text-black hover:bg-black hover:text-white'
                  } transition`}
                  aria-label="social link"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-base font-semibold uppercase tracking-[3px] text-black">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      to="/shop"
                      className="text-sm text-black/60 transition hover:text-black"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="mt-12 border-black/10" />
        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-black/60">
            Shop.co © 2000-2023, All Rights Reserved
          </p>
          <div className="flex items-center gap-2.5">
            {payments.map((p) => (
              <PaymentBadge key={p.label} {...p} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
