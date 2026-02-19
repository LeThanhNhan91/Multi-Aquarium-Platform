import { AquariumLoader } from "@/components/shared/AquariumLoader";

interface FullScreenLoaderProps {
  isLoading: boolean;
  text?: string;
  size?: "sm" | "md" | "lg";
  backgroundColor?: string;
}

export const FishLoading = ({
  isLoading,
  text = "Đang tải...",
  size = "lg",
  backgroundColor = "bg-white",
}: FullScreenLoaderProps) => {
  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${backgroundColor}`}
      style={{ isolation: "isolate" }}
    >
      <AquariumLoader size={size} text={text} showText={true} />
    </div>
  );
};
