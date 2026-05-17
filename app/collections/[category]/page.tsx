import CategoryView from './CategoryView'

interface PageProps {
  params: Promise<{ category: string }>
}

// Next.js 15 forces route parameter contexts to be explicitly awaited
export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params
  
  return (
    <CategoryView rawCategory={resolvedParams.category} />
  )
}