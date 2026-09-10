'use client';

const technologies = [
  'React',
  'Next.js',
  'Node.js',
  'TypeScript',
  'Python',
  'TensorFlow',
  'AWS',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'PostgreSQL',
  'Redis',
  'MongoDB',
  'Figma',
];

export default function TechStack() {
  return (
    <section className="py-20 bg-slate-900 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <h3 className="text-slate-400 font-medium uppercase tracking-widest text-sm">
          Trusted by top companies and startups usually
        </h3>
      </div>

      <div className="relative flex overflow-hidden group">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...technologies, ...technologies].map((tech, index) => (
            <div
              key={index}
              className="mx-8 text-2xl font-bold text-slate-600 hover:text-white transition-colors cursor-default"
            >
              {tech}
            </div>
          ))}
        </div>

        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex">
          {[...technologies, ...technologies].map((tech, index) => (
            <div
              key={`clone-${index}`}
              className="mx-8 text-2xl font-bold text-slate-600 hover:text-white transition-colors cursor-default"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

