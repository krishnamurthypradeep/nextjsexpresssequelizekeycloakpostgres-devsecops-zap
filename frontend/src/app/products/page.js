import Link from "next/link";

export default function Products() {
    return (
        <>
        <h2> Product Page</h2>
        <Link href={"/products/vendors"}>Vendors</Link>

        </>
    )
}