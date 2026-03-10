export default function SessionsTableSkeleton() {
  return (
    <div className="max-w-[1200px] w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="text-[11px] tracking-wide text-neutral-400 font-medium px-3 py-2">
              Session
            </th>
            <th className="text-[11px] tracking-wide text-neutral-400 font-medium px-3 py-2 w-[110px]">
              Status
            </th>
            <th className="text-[11px] tracking-wide text-neutral-400 font-medium px-3 py-2 w-[80px] text-right">
              Open
            </th>
            <th className="text-[11px] tracking-wide text-neutral-400 font-medium px-3 py-2 w-[90px] text-right">
              Resolved
            </th>
            <th className="text-[11px] tracking-wide text-neutral-400 font-medium px-3 py-2 w-[120px] text-right">
              Progress
            </th>
            <th className="text-right w-[140px] text-[11px] tracking-wide text-neutral-400 font-medium px-3 py-2">
              Last Activity
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr
              key={i}
              className="border-b border-[rgba(0,0,0,0.06)]"
            >
              <td className="px-3 py-[12px]">
                <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse" />
                <div className="h-3 w-24 rounded bg-neutral-200 animate-pulse mt-2" />
              </td>
              <td className="px-3 py-[12px]">
                <div className="h-4 w-14 rounded bg-neutral-200 animate-pulse" />
              </td>
              <td className="px-3 py-[12px] text-right">
                <div className="h-4 w-6 rounded bg-neutral-200 animate-pulse inline-block" />
              </td>
              <td className="px-3 py-[12px] text-right">
                <div className="h-4 w-6 rounded bg-neutral-200 animate-pulse inline-block" />
              </td>
              <td className="px-3 py-[12px]">
                <div className="h-1.5 w-20 rounded-full bg-neutral-200 animate-pulse" />
              </td>
              <td className="px-3 py-[12px] text-right">
                <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse inline-block ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
