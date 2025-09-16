import ProductForm from "@/components/ProductForm";
import Link from "next/link";

export default async function EditProductPage({params}) {
    const product = {}
return (
    <div>
      <p><Link href={`/products/${params.id}`}>← Back to details</Link></p>
      <h2 className="title">Edit: {product.name}</h2>
      <ProductForm mode="edit" initial={product} />
    </div>
  );

}