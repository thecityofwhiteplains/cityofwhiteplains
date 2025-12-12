export default function Footer() {
    return (
      <footer className="mt-12 border-t border-[#ECEEF3] bg-white pt-5 text-[11px] text-[#5A6270]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-2 pb-6 sm:px-0 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3 rounded-lg px-1 py-1 text-[12px] font-semibold text-[#1C1F2A]">
              <span className="uppercase tracking-wide text-[#0F3F8C]">
                Local payments
              </span>
              <a
                href="https://whiteplains.citationportal.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#0F3F8C] px-3 py-1 font-semibold text-[#0F3F8C] transition hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              >
                Pay Parking Ticket
              </a>
              <a
                href="http://parkwhiteplains.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#0F3F8C] px-3 py-1 font-semibold text-[#0F3F8C] transition hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              >
                Pay Meter by Mobile
              </a>
              <a
                href="https://cwp.munisselfservice.com/citizens/default.aspx"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#0F3F8C] px-3 py-1 font-semibold text-[#0F3F8C] transition hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              >
                Pay Taxes
              </a>
              <a
                href="https://cwp.munisselfservice.com/citizens/default.aspx"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#0F3F8C] px-3 py-1 font-semibold text-[#0F3F8C] transition hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              >
                Pay Water &amp; Sewer
              </a>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="/about" className="hover:text-[#1C1F2A]">
                About
              </a>
              <a href="/contact" className="hover:text-[#1C1F2A]">
                Contact
              </a>
              <a href="/privacy-policy" className="hover:text-[#1C1F2A]">
                Privacy
              </a>
              <a href="/affiliate-disclosure" className="hover:text-[#1C1F2A]">
                Affiliate Disclosure
              </a>
              <a href="/terms" className="hover:text-[#1C1F2A]">
                Terms
              </a>
            </div>
          </div>
          <p className="max-w-md">
            CityOfWhitePlains.org is an independent local guide and is not the
            official City of White Plains government website.
          </p>
        </div>
      </footer>
    );
  }
