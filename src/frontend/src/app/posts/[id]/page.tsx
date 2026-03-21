import PostDetailPage from "@/features/feeds/PostDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostRoute({ params }: Props) {
  const { id } = await params;
  return <PostDetailPage postId={id} />;
}
