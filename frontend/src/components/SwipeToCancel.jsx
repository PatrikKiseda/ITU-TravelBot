import React, { useRef, useState } from "react";
import "./SwipeToCancel.css";

export default function SwipeToCancel({ onCancel, onBack }) {
  const trackRef = useRef(null);
  const [dragX, setDragX] = useState(0);
  const draggingRef = useRef(false);

  const startXRef = useRef(0);

  const startDrag = (e) => {
    e.preventDefault();
    draggingRef.current = true;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX - dragX;

    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", onDrag);
    document.addEventListener("touchend", stopDrag);
  };

  const onDrag = (e) => {
    if (!draggingRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const track = trackRef.current;
    const thumb = track.querySelector(".swipe-thumb");

    let newDragX = clientX - startXRef.current;
    // Keep thumb within track bounds
    newDragX = Math.max(0, Math.min(newDragX, track.offsetWidth - thumb.offsetWidth));

    setDragX(newDragX);
  };

  const stopDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const track = trackRef.current;
    const thumb = track.querySelector(".swipe-thumb");

    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();

    // Thumb's right edge relative to track's left
    const swipePercent = (thumbRect.right - trackRect.left) / trackRect.width;

    // Only trigger cancel if threshold crossed
    if (swipePercent >= 0.3) {
      if (onCancel) onCancel();
    }

    // Reset thumb back to start regardless of threshold
    setDragX(0);

    // Clean up event listeners
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", stopDrag);
  };

  return (
    <div className="swipe-panel">
      <button className="cancel-back-button" onClick={onBack}>
        Go back
      </button>

      <div className="swipe-track" ref={trackRef}>
        <div className="swipe-text">Swipe to cancel</div>

        <div
          className="swipe-thumb"
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          style={{ transform: `translateX(${dragX}px)` }}
        >
          ❯
        </div>
      </div>
    </div>
  );
}
