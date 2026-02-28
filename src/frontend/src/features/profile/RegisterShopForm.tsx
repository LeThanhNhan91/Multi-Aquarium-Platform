"use client";

import { useState } from "react";
import {
  Store,
  ArrowRight,
  User,
  Phone,
  FileText,
  ImagePlus,
  MapPin,
  Loader2,
  CheckCircle2,
  Camera,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateStoreMutation,
  useUpdateStoreLogoMutation,
  useUpdateStoreCoverMutation,
} from "@/services/storeApi";
import { cn } from "@/utils/utils";

const REGISTER_STEPS = [
  {
    id: "info",
    icon: User,
    label: "Thông tin cửa hàng",
    desc: "Tên, mô tả, địa chỉ",
  },
  { id: "media", icon: ImagePlus, label: "Hình ảnh", desc: "Logo & Ảnh bìa" },
  { id: "confirm", icon: FileText, label: "Xác nhận", desc: "Kiểm tra lại" },
];

export function RegisterShopForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    deliveryArea: "",
    description: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateLogo, { isLoading: isUploadingLogo }] =
    useUpdateStoreLogoMutation();
  const [updateCover, { isLoading: isUploadingCover }] =
    useUpdateStoreCoverMutation();
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "logo") {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      } else {
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
      }
    }
  };

  const validateInfo = () => {
    if (!formData.name || !formData.phoneNumber || !formData.address) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ các trường bắt buộc (*)",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateInfo()) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      await createStore({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        deliveryArea: formData.deliveryArea,
        description: formData.description,
        logo: logoFile || undefined,
        cover: coverFile || undefined,
      }).unwrap();

      toast({
        title: "Đăng ký thành công!",
        description: "Cửa hàng của bạn đang được chờ duyệt.",
      });

      setCurrentStep(3);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi đăng ký",
        description:
          error?.data?.message || "Đã có lỗi xảy ra khi tạo cửa hàng",
      });
    }
  };

  const isLoading = isCreating || isUploadingLogo || isUploadingCover;

  if (currentStep === 3) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold  text-foreground mb-3">
          Đăng ký thành công!
        </h2>
        <p className="text-muted-foreground mb-8">
          Hồ sơ của bạn đã được gửi đi. Đội ngũ admin sẽ xem xét và phản hồi
          trong vòng 24-48 giờ làm việc.
        </p>
        <Button
          onClick={() => (window.location.href = "/profile")}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          Quay lại trang cá nhân
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold  text-foreground mb-2">
          Mở cửa hàng mới
        </h1>
        <p className="text-sm text-muted-foreground">
          Bắt đầu hành trình kinh doanh thủy sinh của bạn
        </p>
      </div>

      {/* Progress Steps */}
      <div className="relative flex justify-between mb-12 px-4">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/40 -translate-y-1/2 z-0" />
        {REGISTER_STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isActive
                    ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20"
                    : isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-background border-border text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="absolute -bottom-8 whitespace-nowrap text-center">
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên cửa hàng *</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="VD: Aqua Dream"
                    className="pl-10"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại liên hệ *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    placeholder="0987xxxxxx"
                    className="pl-10"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="Nhập địa chỉnh chính xác"
                  className="pl-10"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryArea">Khu vực giao hàng</Label>
              <Input
                id="deliveryArea"
                placeholder="VD: Quận 1, Quận 7, Toàn quốc..."
                value={formData.deliveryArea}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả cửa hàng</Label>
              <textarea
                id="description"
                rows={4}
                placeholder="Giới thiệu đôi nét về cửa hàng của bạn..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Logo Upload */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Logo cửa hàng</Label>
              <div className="flex items-center gap-6">
                <div className="relative h-24 w-24 shrink-0 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 group">
                  {logoPreview ? (
                    <>
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-6 w-6 text-white" />
                      </button>
                    </>
                  ) : (
                    <Label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="text-[10px] font-bold">TẢI LÊN</span>
                    </Label>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "logo")}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">
                    Ảnh đại diện shop
                  </p>
                  <p>Tỉ lệ khuyên dùng 1:1 (Hình vuông)</p>
                  <p>Tối đa 2MB, định dạng PNG, JPG</p>
                </div>
              </div>
            </div>

            {/* Cover Upload */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Ảnh bìa cửa hàng
              </Label>
              <div className="relative aspect-3/1 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 group">
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </button>
                  </>
                ) : (
                  <Label
                    htmlFor="cover-upload"
                    className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs font-bold uppercase">
                      Tải lên ảnh bìa
                    </span>
                  </Label>
                )}
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "cover")}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                Thông tin chung
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-muted-foreground">Tên cửa hàng:</div>
                <div className="text-foreground font-medium">
                  {formData.name}
                </div>
                <div className="text-muted-foreground">Điện thoại:</div>
                <div className="text-foreground font-medium">
                  {formData.phoneNumber}
                </div>
                <div className="text-muted-foreground">Địa chỉ:</div>
                <div className="text-foreground font-medium">
                  {formData.address}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {logoPreview && (
                <div className="h-20 w-20 rounded-xl overflow-hidden border border-border">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              {coverPreview && (
                <div className="flex-1 rounded-xl overflow-hidden border border-border h-20">
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-700 leading-relaxed">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Bằng cách nhấn gửi, bạn đồng ý với Điều khoản và Chính sách
                người bán của AquaMarket. Cửa hàng sẽ được đội ngũ admin kiểm
                duyệt nội dung trước khi đi vào hoạt động chính thức.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        {currentStep > 0 ? (
          <Button variant="outline" onClick={handleBack} disabled={isLoading}>
            Quay lại
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 2 ? (
          <Button
            onClick={handleNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            Tiếp tục
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Gửi đăng ký"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
