/** Strip .md extension from content collection IDs for clean URLs */
export function cleanSlug(id: string): string {
  return id.replace(/\/index\.md$/, '').replace(/\.md$/, '');
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
