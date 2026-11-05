export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-xl ${className}`} />;
}

export function ProfileSkeleton() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div role="status" aria-label="Cargando perfil" className="glass w-full max-w-sm rounded-3xl p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-32 w-32 !rounded-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full !rounded-full" />
        </div>
      </div>
    </main>
  );
}

export function HomeSkeleton({ withCountdown = false }: { withCountdown?: boolean }) {
  return (
    <>
      {withCountdown && (
        <div className="flex flex-col items-center gap-5">
          <Skeleton className="h-9 w-64" />
          <div className="flex gap-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[112px] w-[76px] !rounded-3xl sm:w-[112px]" />
            ))}
          </div>
        </div>
      )}
      <HomeCardsSkeleton />
    </>
  );
}

function HomeCardsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className="flex w-full flex-wrap items-start justify-center gap-10"
    >
      {[0, 1].map((i) => (
        <div key={i} className="w-full max-w-xs rounded-[1.75rem] bg-cream/5 p-6">
          <div className="flex flex-col items-center gap-3 pt-3">
            <Skeleton className="h-24 w-24 !rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="mt-2 h-8 w-32 !rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div role="status" aria-label="Cargando lista">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-11 w-11 !rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <Skeleton className="h-[calc(100dvh-13rem)] min-h-[420px] w-full !rounded-2xl" />
    </div>
  );
}

export function MailboxSkeleton() {
  return (
    <div role="status" aria-label="Cargando cartas" className="mt-4">
      <Skeleton className="h-10 w-64 !rounded-full" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 !rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
