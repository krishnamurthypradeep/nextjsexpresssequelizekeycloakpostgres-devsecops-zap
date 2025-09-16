import { getProduct } from "@/lib/api"
import Link from "next/link"

import Image from "next/image"
export default async function ProductPage({params}) {
    const id = await params.id
  const p =  await getProduct(id)
  if(!p)
    return <div>Product Not Found</div>
    return (
        <div className="space-y-6">
  {/* Back link */}
  <p>
    <Link
      href="/"
      className="text-sm font-medium text-blue-600 hover:text-blue-800"
    >
      ← Back
    </Link>
  </p>

  {/* Title */}
  <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
    {p.name}
  </h2>

  {/* Product details */}
  <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
   {p.imageUrl && <Image
      className="rounded-md ring-1 ring-gray-200"
      src={p.imageUrl}
      alt={p.name}
      width={100}
      height={100}
    />
   }
    <div className="space-y-2 text-gray-700">
      <p>
        <span className="font-semibold text-gray-900">Code:</span> {p.code}
      </p>
      <p>
        <span className="font-semibold text-gray-900">Available:</span>{" "}
        {new Date(p.available).toLocaleDateString()}
      </p>
      <p>
        <span className="font-semibold text-gray-900">Price:</span> $
        {p.price}
      </p>
      <p>
        <span className="font-semibold text-gray-900">Rating:</span> {p.rating} / 5
      </p>
      <p className="text-gray-600">{p.description}</p>
    </div>
  </div>

  {/* Actions */}
  <div className="flex gap-3">
    <Link href={`/products/${p.id}/edit`}>
      <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
        Edit
      </button>
    </Link>

    <Link href="/products/new">
      <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300">
        New Product
      </button>
    </Link>
  </div>
</div>

    )
    
}