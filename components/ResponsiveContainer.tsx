export default function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen">
      {/* Max-width container for very large screens */}
      <div className="mx-auto max-w-[1920px]">
        {/* Padding for all screen sizes */}
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {children}
        </div>
      </div>
    </div>
  );
}

