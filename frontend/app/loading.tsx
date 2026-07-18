export default function Loading() {
  return (
    <main className="min-h-[calc(100vh-160px)] bg-[#f5f0e7] px-6 py-16" aria-busy="true" aria-label="Đang tải nội dung">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-3 w-36 bg-[#7a2130]/18" />
        <div className="mt-5 h-12 max-w-xl bg-[#28171a]/12" />
        <div className="mt-4 h-4 max-w-2xl bg-[#28171a]/8" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-[4/5] bg-[#28171a]/8" />
              <div className="mt-5 h-3 w-24 bg-[#7a2130]/14" />
              <div className="mt-3 h-7 w-4/5 bg-[#28171a]/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
