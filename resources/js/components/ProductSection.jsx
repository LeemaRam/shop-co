import ProductCard from './ProductCard'

export default function ProductSection({ title, products, id }) {
  return (
    <section id={id} className="container-shop py-8 sm:py-14">
      <h2 className="display text-center text-[32px] leading-none sm:text-[46px]">
        {title}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-14 lg:grid-cols-4 lg:gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="mt-8 flex justify-center sm:mt-9">
        <a
          href="/shop"
          className="rounded-full border border-black/10 px-14 py-3.5 text-sm font-medium transition hover:bg-black hover:text-white"
        >
          View All
        </a>
      </div>
    </section>
  )
}
