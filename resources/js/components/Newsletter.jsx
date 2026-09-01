import { MailIcon } from './Icons'

export default function Newsletter() {
  return (
    <section className="container-shop relative z-10 -mb-[92px] sm:-mb-[110px] translate-y-[92px] sm:translate-y-[110px]">
      <div className="rounded-[20px] bg-black px-6 py-8 sm:px-16 sm:py-11">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <h2 className="display max-w-xl text-[32px] leading-[1.05] text-white sm:text-[40px]">
            Stay upto date about our latest offers
          </h2>
          <form
            className="w-full max-w-[349px] space-y-3.5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3">
              <MailIcon className="h-6 w-6 text-black/40" />
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="w-full bg-transparent text-base outline-none placeholder:text-black/40"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-white py-3 text-base font-medium text-black transition hover:bg-white/90"
            >
              Subscribe to Newsletter
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
