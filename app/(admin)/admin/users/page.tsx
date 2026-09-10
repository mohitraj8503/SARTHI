import React from 'react';
import UsersClient from './UsersClient';

export const metadata = {
  title: 'User Management | SARTHI Admin',
  description: 'Manage all platform users, roles, and permissions.',
};

export default function UsersPage() {
  return <UsersClient />;
}

