'use client';

import Link from 'next/link';

export default function GitHubSignInButton() {
  return (
    <Link
      href="/api/auth/login/github"
      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 rounded-lg transition-colors border border-transparent"
    >
      <svg
        className="w-5 h-5 mr-2"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 .333A9.911 9.911 0 0 0 .333 10c0 4.489 2.391 8.291 5.679 9.387.496.09.679-.217.679-.479 0-.237-.008-1.015-.013-1.849-2.32.505-2.81-1.122-2.81-1.122-.452-1.152-1.107-1.46-1.107-1.46-.757-.519.057-.51.057-.51.838.058 1.279.864 1.279.864.75 1.285 1.967.913 2.447.697.076-.542.293-.913.533-1.122-1.853-.211-3.801-.926-3.801-4.12 0-.91.325-1.655.86-2.238-.086-.21-.373-1.06.082-2.207 0 0 .703-.225 2.304.86a8.02 8.02 0 0 1 2.096-.282 8.01 8.01 0 0 1 2.096.282c1.602-1.085 2.303-.86 2.303-.86.457 1.147.17 1.997.085 2.207.536.583.86 1.328.86 2.238 0 3.199-1.951 3.905-3.809 4.113.3.26.57.771.57 1.554 0 1.122-.01 2.028-.01 2.304 0 .265.186.573.687.476 3.284-1.096 5.673-4.899 5.673-9.394A9.911 9.911 0 0 0 10 .333Z"
          clipRule="evenodd"
        />
      </svg>
      Sign in with GitHub
    </Link>
  );
}

