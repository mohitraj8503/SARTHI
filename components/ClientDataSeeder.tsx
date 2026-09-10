'use client';

import { useEffect } from 'react';
import { storage } from '@/lib/storage';
import { INITIAL_COURSES, INITIAL_INSTRUCTORS, INITIAL_SEMINARS } from '@/lib/initial-data';
import { Course } from '@/lib/types';

export default function ClientDataSeeder() {
    // Client-side seeding is disabled to enforce "Real Data Only" policy.
    // This component now does nothing.
    return null;
}

