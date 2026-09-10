import { redirect } from 'next/navigation';

export default function MyBlogsRedirectPage() {
  redirect('/dashboard/blogs');
}
