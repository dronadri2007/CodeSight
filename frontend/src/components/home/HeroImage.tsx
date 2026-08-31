/* Design philosophy: White + Blue Clean Developer Workspace. Keep the real hero photograph integrated within light clean framing and semantic signals. */
export default function HeroImage() {
  return (
    <div className="hidden lg:block">
      <div className="relative ml-auto h-[350px] max-w-[620px] overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_20px_50px_rgba(0,0,0,.08)]">
        <img
          src="/assets/images/codesight-programming-laptop.jpg"
          alt="Learners collaborating around a laptop displaying programming code"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,.85)_0%,rgba(255,255,255,.55)_44%,rgba(255,255,255,.82)_100%)]"/>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-[#E2E8F0] bg-[#FFFFFF]/90 px-4 py-3 backdrop-blur-[2px]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]"/>
              <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]"/>
              <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]"/>
            </div>
            <span className="mono text-[10px] text-[#64748B]">learning_trace.jpg</span>
          </div>
          <span className="badge-medium rounded border px-2 py-0.5 mono text-[9px] font-semibold uppercase tracking-[.08em]">
            case active
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/85 to-transparent px-5 pb-5 pt-24">
          <div className="eyebrow text-[#2563EB]">Practice in context</div>
          <div className="mt-2 max-w-[380px] display text-[20px] font-semibold text-[#0F172A]">
            The best bug hunts happen when the code has a reason to matter.
          </div>
          <div className="mt-3 flex items-center gap-2 mono text-[9px] text-[#64748B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB]"/> TRACE · LOCATE · UNDERSTAND
          </div>
        </div>
      </div>
    </div>
  );
}

