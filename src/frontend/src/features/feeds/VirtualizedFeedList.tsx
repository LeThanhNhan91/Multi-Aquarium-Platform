"use client";

import React from "react";
import { List, RowComponentProps, useDynamicRowHeight } from "react-window";
import { PostFeed } from "@/types/post.type";
import { PostCard } from "@/features/feeds/PostCard";

interface RowProps {
  posts: PostFeed[];
  onOpenDetail: (index: number) => void;
}

/**
 * Row component optimized with React.memo to prevent unnecessary re-renders.
 * Standardizes the data-react-window-index attribute for useDynamicRowHeight.
 */
const RowInner = React.memo(
  ({ index, style, posts, onOpenDetail }: RowComponentProps<RowProps>) => {
    const post = posts[index];
    if (!post) return <div style={style} />; // Ensure always return a valid element with style

    return (
      <div style={style} className="px-4" data-react-window-index={index}>
        <div className="pb-4 max-w-xl mx-auto">
          <PostCard post={post} onOpenDetail={() => onOpenDetail(index)} />
        </div>
      </div>
    );
  },
);

RowInner.displayName = "VirtualizedFeedRowInner";

// Functional wrapper to strictly satisfy react-window's component type requirement
const Row = (props: RowComponentProps<RowProps>) => <RowInner {...props} />;

interface VirtualizedFeedListProps {
  posts: PostFeed[];
  height: number;
  onRowsRendered: (rows: { startIndex: number; stopIndex: number }) => void;
  onOpenDetail: (index: number) => void;
  listRef: React.RefObject<any>;
}

/**
 * Production-grade virtualized list using react-window v2.x with auto-measurement.
 * Automatically measures heights using ResizeObserver via useDynamicRowHeight hook.
 */
export default function VirtualizedFeedList({
  posts,
  height,
  onRowsRendered,
  onOpenDetail,
  listRef,
}: VirtualizedFeedListProps) {
  // useDynamicRowHeight for zero-config auto-measurement
  // defaultRowHeight should be a reasonable initial estimate
  const dynamicRowHeight = useDynamicRowHeight({
    defaultRowHeight: 400,
  });

  return (
    <div style={{ height }} className="w-full">
      <List
        listRef={listRef}
        rowCount={posts.length}
        rowHeight={dynamicRowHeight} // Use the auto-measurement hook
        rowComponent={Row}
        rowProps={{ posts, onOpenDetail }}
        onRowsRendered={onRowsRendered}
        overscanCount={5} // Strategic overscan for smoother massive lists
        className="custom-scrollbar"
      />
    </div>
  );
}
