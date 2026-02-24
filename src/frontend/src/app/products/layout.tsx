import { Navbar } from "@/components/shared/navbar";

export default async function ProductsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <Navbar />
      <div className="pt-20">
        <main>{children}</main>
      </div>
    </div>
  );
}
