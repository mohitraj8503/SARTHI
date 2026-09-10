'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';

export default function WelcomeToast() {
  const { addToast } = useToast();

  useEffect(() => {
    const checkStatus = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('signedOut') === 'true') {
          setTimeout(() => {
            addToast({
              title: '✔ Successfully signed out',
              message: 'Sign in again when you\'re ready.',
              type: 'success',
              duration: 6000,
            });
          }, 300);
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
          return;
        }
      }

      const lastVisit = getCookie('last_visit');
      const now = new Date().toISOString();

      if (lastVisit) {
        // Returning user
        setTimeout(() => {
          addToast({ message: 'Welcome back to SARTHI! 🚀', type: 'success' });
        }, 1000);
      } else {
        // New user
        setTimeout(() => {
          addToast({ message: 'Welcome! Start your journey today ✨', type: 'success' });
        }, 1000);
      }

      // Update cookie
      setCookie('last_visit', now, 365);
    };

    checkStatus();
  }, [addToast]);

  return null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

