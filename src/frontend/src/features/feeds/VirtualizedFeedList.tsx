"use client";

import React from "react";
import { List, RowComponentProps } from "react-window";
import { PostFeed } from "@/types/post.type";
import { PostCard } from "@/features/feeds/PostCard";

interface RowProps {
  posts: PostFeed[];
  onToggleExpand: (index: number) => void;
}

const Row = ({ index, style, posts, onToggleExpand }: RowComponentProps<RowProps>) => {
  const post = posts[index];
  if (!post) return null;

  return (
    <div style={style} className="px-4">
      <div className="pb-4 max-w-xl mx-auto">
        <PostCard 
          post={post} 
          onToggleExpand={() => onToggleExpand(index)}
        />
      </div>
    </div>
  );
};

interface VirtualizedFeedListProps {
  posts: PostFeed[];
  height: number;
  itemSize: (index: number) => number;
  onRowsRendered: (rows: { startIndex: number; stopIndex: number }) => void;
  onToggleExpand: (index: number) => void;
  listRef: React.RefObject<any>;
}

export default function VirtualizedFeedList({
  posts,
  height,
  itemSize,
  onRowsRendered,
  onToggleExpand,
  listRef
}: VirtualizedFeedListProps) {
  return (
    <div style={{ height }} className="w-full">
      <List
        listRef={listRef}
        rowCount={posts.length}
        rowHeight={itemSize}
        rowComponent={Row}
        rowProps={{ posts, onToggleExpand }}
        onRowsRendered={(visible) => onRowsRendered(visible)}
        className="custom-scrollbar"
      />
    </div>
  );
}
