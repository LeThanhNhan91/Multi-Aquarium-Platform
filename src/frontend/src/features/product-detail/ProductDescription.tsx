import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ProductDescriptionProps {
  description: string
  categoryName: string
}

export function ProductDescription({
  description,
  categoryName,
}: ProductDescriptionProps) {
  return (
    <div className="space-y-8">
      {/* Description Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-foreground">
          Thông tin chi tiết
        </h2>
        <Card className="border-border/50 bg-card rounded-2xl p-8">
          <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed">
            {description ? (
              <p className="whitespace-pre-wrap">{description}</p>
            ) : (
              <p className="text-muted-foreground">
                Chưa có mô tả chi tiết cho sản phẩm này.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Separator className="bg-border/30" />

      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-serif text-foreground">
          Thông số kỹ thuật
        </h3>
        <Card className="border-border/50 bg-card rounded-2xl divide-y divide-border/50">
          <div className="p-6 flex justify-between items-center">
            <span className="font-semibold text-foreground">Danh mục</span>
            <span className="text-foreground/70">{categoryName}</span>
          </div>
          <div className="p-6 flex justify-between items-center">
            <span className="font-semibold text-foreground">Loại sản phẩm</span>
            <span className="text-foreground/70">{categoryName}</span>
          </div>
          <div className="p-6 flex justify-between items-center">
            <span className="font-semibold text-foreground">Tình trạng</span>
            <span className="text-foreground/70">Mới 100%</span>
          </div>
          <div className="p-6 flex justify-between items-center">
            <span className="font-semibold text-foreground">Bảo hành</span>
            <span className="text-foreground/70">12 tháng</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
