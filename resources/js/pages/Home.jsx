import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductSection from '../components/ProductSection'
import Rating from '../components/Rating'
import { testimonials } from '../data/products'
import api from '../services/api'
import { adaptProducts } from '../services/adapters'
import { ArrowLeft, ArrowRight, CheckBadge } from '../components/Icons'

const brands = ['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'Calvin Klein']

const stats = [
  { value: '200+', label: 'International Brands' },
  { value: '2,000+', label: 'High-Quality Products' },
  { value: '30,000+', label: 'Happy Customers' },
]

const dressStyles = [
  { label: 'Casual', img: '/images/casual_cloths_pose.webp', span: 'lg:col-span-2' },
  { label: 'Formal', img: '/images/formal_cloth_pose.webp', span: 'lg:col-span-3' },
  { label: 'Party', img: '/images/party_cloth_pose.webp', span: 'lg:col-span-3' },
  { label: 'Gym', img: '/images/gym_cloth_pose.webp', span: 'lg:col-span-2' },
]

function Sparkle({ className }) {
  return (
    <svg viewBox="0 0 104 104" className={className} fill="black">
      <path d="M52 0c1 27 24 50 52 52-28 2-51 25-52 52-1-27-24-50-52-52C28 50 51 27 52 0Z" />
    </svg>
  )
}

function Hero() {
  return (
    <section className="overflow-hidden bg-[#F2F0F1]">
      <div className="container-shop grid gap-2 lg:grid-cols-2 lg:items-stretch lg:gap-8">
        <div className="flex flex-col justify-center pt-9 lg:min-h-[calc(100vh-180px)] lg:py-8 lg:pr-4">
          <h1 className="display text-[32px] leading-[0.95] sm:text-[48px] lg:text-[58px]">
            Find clothes that matches your style
          </h1>
          <p className="mt-5 max-w-[545px] text-sm leading-6 text-black/60 sm:text-[15px]">
            Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block w-full rounded-full bg-black px-14 py-3.5 text-center text-sm font-medium text-white transition hover:bg-black/90 sm:mt-8 sm:w-fit"
          >
            Shop Now
          </Link>
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 sm:mt-11 sm:flex sm:items-center sm:gap-6 lg:gap-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`${i > 0 ? 'border-l border-black/10 pl-3 sm:pl-6 lg:pl-8' : ''} ${
                  i === 2
                    ? 'col-span-2 border-l-0 pl-0 text-center sm:col-span-1 sm:border-l sm:pl-6 sm:text-left lg:pl-8'
                    : ''
                }`}
              >
                <div className="text-xl font-bold sm:text-[32px] sm:leading-tight lg:text-[36px]">
                  {s.value}
                </div>
                <div className="text-[11px] text-black/60 sm:text-sm lg:text-sm">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-end justify-center lg:min-h-[calc(100vh-180px)]">
          <Sparkle className="absolute right-2 top-8 z-10 h-9 w-9 sm:right-6 sm:top-16 sm:h-14 sm:w-14 lg:right-0 lg:h-[52px] lg:w-[52px]" />
          <Sparkle className="absolute left-0 top-1/3 z-10 h-6 w-6 sm:h-11 sm:w-11 lg:left-2 lg:top-[36%]" />
          <img
            src="/images/trendy-fashionable-couple-posing.webp"
            alt="Fashionable couple wearing SHOP.CO clothing"
            className="h-auto w-full max-w-md object-contain object-bottom lg:absolute lg:inset-0 lg:h-full lg:max-w-none lg:object-cover lg:object-[center_-4px]"
          />
        </div>
      </div>
    </section>
  )
}

function BrandStrip() {
  return (
    <div className="bg-black">
      <div className="container-shop flex flex-wrap items-center justify-center gap-x-8 gap-y-5 py-5 sm:justify-between sm:gap-x-6 sm:py-7">
        {brands.map((b) => (
          <span
            key={b}
            className="text-xl font-bold text-white sm:text-2xl lg:text-[32px]"
            style={{ fontFamily: b === 'Calvin Klein' ? 'inherit' : undefined }}
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  )
}

function DressStyle() {
  return (
    <section className="container-shop py-8 sm:py-14">
      <div className="rounded-[20px] bg-[#F0F0F0] px-6 py-10 sm:rounded-[40px] sm:px-16 sm:py-16">
        <h2 className="display text-center text-[32px] leading-none sm:text-[46px] uppercase">
          Browse by dress style
        </h2>
        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-5">
          {dressStyles.map((d) => (
            <Link
              key={d.label}
              to="/shop"
              className={`group relative block h-44 overflow-hidden rounded-[20px] bg-white sm:h-[250px] ${d.span}`}
            >
              <img
                src={d.img}
                alt={d.label}
                className="absolute bottom-0 right-0 h-full w-auto max-w-[90%] scale-110 origin-bottom-right object-cover object-top transition-transform duration-300 group-hover:scale-[1.18]"
              />
              <span className="relative z-10 block p-6 text-2xl font-bold sm:text-[32px]">
                {d.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="py-8 sm:py-14">
      <div className="container-shop flex items-end justify-between">
        <h2 className="display text-[32px] leading-none sm:text-[46px]">
          Our happy customers
        </h2>
        <div className="flex items-center gap-4">
          <button aria-label="Previous" className="text-black hover:opacity-60">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <button aria-label="Next" className="text-black hover:opacity-60">
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="no-scrollbar mt-7 flex snap-x gap-5 overflow-x-auto px-4 sm:px-6 lg:px-[calc((100vw-1300px)/2+2rem)]">
        {testimonials.map((t) => (
          <figure
            key={t.id}
            className="w-[300px] shrink-0 snap-start rounded-[20px] border border-black/10 p-7 sm:w-[400px]"
          >
            <Rating value={t.rating} size={18} showValue={false} />
            <figcaption className="mt-3 flex items-center gap-1 text-xl font-bold">
              {t.name}
              <CheckBadge className="h-5 w-5" />
            </figcaption>
            <blockquote className="mt-3 text-sm leading-6 text-black/60">
              “{t.text}”
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([])
  const [topSelling, setTopSelling] = useState([])

  useEffect(() => {
    let active = true
    api
      .newArrivals()
      .then((r) => active && setNewArrivals(adaptProducts(r.data)))
      .catch(() => {})
    api
      .featured()
      .then((r) => active && setTopSelling(adaptProducts(r.data)))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Hero />
      <BrandStrip />
      <ProductSection id="new-arrivals" title="New Arrivals" products={newArrivals} />
      <div className="container-shop">
        <hr className="border-black/10" />
      </div>
      <ProductSection id="top-selling" title="Top Selling" products={topSelling} />
      <DressStyle />
      <Testimonials />
    </>
  )
}
