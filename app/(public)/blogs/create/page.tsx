import { redirect } from 'next/navigation';

export default function CreateBlogRedirectPage() {
  redirect('/dashboard/blogs/new');
}
