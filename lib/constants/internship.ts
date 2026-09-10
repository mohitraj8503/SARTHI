export const PREFERRED_TRACKS = [
  'Software Development',
  'Web Development',
  'Research & Development (R&D)',
  'Content Writing & Blogging',
  'Digital Marketing & Social Media',
  'Graphic Design & Poster Making',
  'Video Editing & Reels Production',
  'Advertising & Ad Campaign Strategy',
] as const;

export type PreferredTrack = (typeof PREFERRED_TRACKS)[number];

