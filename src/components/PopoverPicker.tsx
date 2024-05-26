import { Color } from "@/lib/light/Color";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RgbaColorPicker } from "react-colorful";

const useClickOutside = (
  ref: React.RefObject<HTMLDivElement>,
  handler: Function,
) => {
  useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) {
        return;
      }
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    const validateEventStart = (event: MouseEvent | TouchEvent) => {
      startedWhenMounted = !!ref.current;
      startedInside =
        !!ref.current && ref.current.contains(event.target as Node);
    };

    document.addEventListener("mousedown", validateEventStart);
    document.addEventListener("touchstart", validateEventStart);
    document.addEventListener("click", listener);

    return () => {
      document.removeEventListener("mousedown", validateEventStart);
      document.removeEventListener("touchstart", validateEventStart);
      document.removeEventListener("click", listener);
    };
  }, [ref, handler]);
};

interface PopoverPickerProps {
  color: Color;
  onChange: (color: Color) => void;
}

export const PopoverPicker = ({ color, onChange }: PopoverPickerProps) => {
  const popover = useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = useState(false);

  const close = useCallback(() => toggle(false), []);
  useClickOutside(popover, close);

  return (
    <div className="relative w-full">
      <div
        className="h-4 w-full cursor-pointer rounded"
        style={{
          backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
        }}
        onClick={() => toggle(true)}
      />

      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+2px)] rounded"
          ref={popover}
        >
          <RgbaColorPicker
            color={{
              r: color.r,
              g: color.g,
              b: color.b,
              a: color.a,
            }}
            onChange={(color) => {
              onChange(new Color(color.r, color.g, color.b, color.a));
            }}
            className="z-10"
          />
        </div>
      )}
    </div>
  );
};
