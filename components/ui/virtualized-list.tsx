"use client";

import { useRef, useCallback, memo, ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * High-performance virtualized list component
 * Only renders visible items for better performance with large datasets
 */
function VirtualizedListInner<T>({
  items,
  renderItem,
  estimateSize = 64,
  overscan = 5,
  className = "",
  itemClassName = "",
  getItemKey,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: getItemKey
      ? (index) => getItemKey(items[index], index)
      : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ contain: "strict" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            className={itemClassName}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListInner) as typeof VirtualizedListInner;

/**
 * Virtualized table body component
 */
interface VirtualizedTableProps<T> {
  items: T[];
  renderRow: (item: T, index: number) => ReactNode;
  rowHeight?: number;
  overscan?: number;
  className?: string;
  getRowKey?: (item: T, index: number) => string | number;
  maxHeight?: number | string;
}

function VirtualizedTableInner<T>({
  items,
  renderRow,
  rowHeight = 56,
  overscan = 10,
  className = "",
  getRowKey,
  maxHeight = 600,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
    getItemKey: getRowKey
      ? (index) => getRowKey(items[index], index)
      : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ maxHeight, contain: "strict" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <table className="w-full">
          <tbody>
            {virtualItems.map((virtualItem) => (
              <tr
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                  display: "table-row",
                }}
              >
                {renderRow(items[virtualItem.index], virtualItem.index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const VirtualizedTable = memo(VirtualizedTableInner) as typeof VirtualizedTableInner;

/**
 * Hook for virtualizing any scrollable container
 */
export function useVirtualList<T>(
  items: T[],
  options: {
    estimateSize?: number;
    overscan?: number;
    getItemKey?: (item: T, index: number) => string | number;
  } = {}
) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { estimateSize = 64, overscan = 5, getItemKey } = options;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: getItemKey
      ? (index) => getItemKey(items[index], index)
      : undefined,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}
