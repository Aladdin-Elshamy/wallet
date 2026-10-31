"use client";

import { adapter } from "@/adapter";
import { httpService } from "@/services";
import { socket } from "@/socket";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function Home() {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [transcations, setTranscations] = useState<NormalizeTranscation>({
    references: [],
    byReferences: {},
  });
  // Entity Store
  const buffer = useRef<NormalizeTranscation>({
    references: [],
    byReferences: {},
  });
  const [pause, setPause] = useState(false);
  const pauseRef = useRef(pause);
  const isFirstRender = useRef(!transcations.references.length);

  // Virtualization
  const virtualizer = useVirtualizer({
    count: transcations.references.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
  });

  useEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  useLayoutEffect(() => {
    virtualizer.scrollToEnd();
  }, [transcations, virtualizer]);

  useEffect(() => {
    socket.connect();
    function handleSocketMessage(data: string) {
      const normalizedData = adapter.adaptSocket(data);
      buffer.current = {
        byReferences: {
          ...buffer.current.byReferences,
          ...normalizedData?.byReferences,
        },
        references: [
          ...new Set([
            ...buffer.current.references,
            ...normalizedData?.references,
          ]),
        ],
      };
      if (isFirstRender.current) isFirstRender.current = false;
    }
    socket.on("message", handleSocketMessage);
    // fetch transactions from /api/feed
    async function fetchTranscations() {
      try {
        const data: NormalizeTranscation | null =
          await adapter.adaptFeed(httpService);
        if (!data) return;
        buffer.current = {
          byReferences: {
            ...buffer.current.byReferences,
            ...data?.byReferences,
          },
          references: [
            ...new Set([...buffer.current.references, ...data?.references]),
          ],
        };
        if (isFirstRender.current) isFirstRender.current = false;
      } catch (error) {
        console.error("Error fetching transcations:", error);
      }
    }
    const fetchTranscationsInterval = setInterval(
      async () => await fetchTranscations(),
      1000,
    );

    // ingestion buffer
    const interval = setInterval(() => {
      if (!buffer.current.references.length || pauseRef.current) return;
      const batch = buffer.current;
      buffer.current = { references: [], byReferences: {} };
      setTranscations((prev) => ({
        references: [...new Set([...prev.references, ...batch.references])],
        byReferences: { ...prev.byReferences, ...batch.byReferences },
      }));
    }, 5000);
    return () => {
      clearInterval(fetchTranscationsInterval);
      clearInterval(interval);
      socket.off("message", handleSocketMessage);
      socket.disconnect();
    };
  }, []);
  if (isFirstRender.current) return <h1>loading</h1>;
  return (
    <>
      <button
        className="mb-5 rounded-lg border border-solid border-gray-500 bg-slate-500 sticky top-0 z-10"
        onClick={() => setPause(!pause)}
      >
        {pause ? "Resume" : "Pause"}
      </button>
      <div
        ref={parentRef}
        style={{
          height: `600px`,
          overflow: "auto", // Make it scroll!
        }}
      >
        <div className="grid grid-cols-4 sticky top-0 bg-gray-300 dark:bg-black z-10 text-center">
          <div>Date</div>
          <div>Amount</div>
          <div>Reference</div>
          <div>Note</div>
        </div>
        {/* The large inner element to hold all of the items */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Only the visible items in the virtualizer, manually positioned to be in view */}
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const transcation =
              transcations.byReferences[
                transcations.references[virtualItem.index]
              ];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  textAlign: "center",
                }}
              >
                <div>{transcation.date}</div>
                <div>{transcation.amount}</div>
                <div>{transcation.reference}</div>
                <div>{transcation?.note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
