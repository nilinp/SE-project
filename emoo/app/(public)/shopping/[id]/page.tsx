import products from "@/app/data/product.json";
import { notFound } from "next/navigation";

export default function Productdetail({
  params,
}: {
  params: { id: string };
}) {
  const product = products.product.find(
    (item) => item.id.toString() === params.id
  );

  if (!product) return notFound();

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-2xl mt-3">{product.price} ฿</p>
      <p className="mt-4">{product.details}</p>
    </div>
  );
}