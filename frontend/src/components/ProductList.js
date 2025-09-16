"use client"
import Link from "next/link"
import Image from "next/image"
import { useMemo, useState } from "react"
export const ProductsList = ({products})=>{

     const [filter,setFilter] = useState("")
      const [show,setShow]   = useState(true) 
   const filtered =  useMemo(()=>{
       const f = filter.trim().toLowerCase()
       if(!f) return products
       return products.filter(p => p.name.toLowerCase().includes(f))

    },[filter,products])
    
    return (
        <div className="space-y-6">
  
  <div>
    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Product List</h2>

    <div className="mt-4 flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span className="shrink-0">Filter by:</span>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="type to filter..."
          className="w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
        Filtered by: {filter || "—"}
      </span>

      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="ml-auto inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        {show ? "Hide Image" : "Show Image"}
      </button>
    </div>
  </div>

  {/* Table */}
  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-24 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Image
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Product
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Code
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Available
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Price
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              5 Star Rating
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {filtered.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                {show && p.imageUrl ?  (
                  <Image
                    className="rounded-md ring-1 ring-gray-200"
                    src={p.imageUrl}
                    alt={p.name}
                    width={50}
                    height={50} unoptimized
                  />
                ) : null}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/products/${p.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {p.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-700">{p.code}</td>
              <td className="px-4 py-3 text-gray-700">
                {new Date(p.available).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">
                ${p.price}
              </td>
              <td className="px-4 py-3 text-gray-700">
                
                
                {p.rating}
                <span className="ml-2 text-sm text-gray-500">({p.rating})</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

    )
}