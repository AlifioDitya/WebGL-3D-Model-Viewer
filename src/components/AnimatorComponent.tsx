import { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdOutlineAnimation } from "react-icons/md";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  CaretSortIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  TrackNextIcon,
  TrackPreviousIcon,
} from "@radix-ui/react-icons";
import { ObjectTreeNode } from "@/lib/object/ObjectTreeNode";
import { useFindObjectInTree } from "@/lib/helper/findObjectInTree";
import AnimationRunner from "@/lib/animation/AnimationRunner";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimationClip } from "@/lib/animation/Animation";
import {
  EaseType,
  EaseVariant,
  easeType,
  easeVariant,
} from "@/lib/animation/AnimationTweening";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "react-toastify";

interface AnimatorComponentProps {
  sceneObjects: ObjectTreeNode[];
  selectedObjectUUID: string | null;
  setSelectedObjectUUID: (id: string) => void;
  updateObjectInState: (obj: ObjectTreeNode) => void;
}

export default function AnimatorComponent({
  sceneObjects,
  selectedObjectUUID,
  updateObjectInState,
}: AnimatorComponentProps): JSX.Element {
  const animationRef = useRef<AnimationRunner | null>(null);
  const requestAnimationRef = useRef<number | null>(null);
  const animationInputRef = useRef<HTMLInputElement | null>(null);
  const lastFrameTimeRef = useRef<number>(performance.now());

  const [max, setMax] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(true);
  const [frame, setFrame] = useState<number>(0);
  const [loop, setLoop] = useState<boolean>(true);
  const [reverse, setReverse] = useState<boolean>(false);
  const [interpolate, setInterpolate] = useState<boolean>(false);
  const [ease, setEase] = useState<EaseType>("linear");
  const [variant, setVariant] = useState<EaseVariant>("in");
  const [animClip, setAnimClip] = useState<AnimationClip | null>(null);
  const [animFileName, setAnimFileName] = useState<string>("");

  const findObjectInTree = useFindObjectInTree();
  const fpsInterval = 1000 / 60; // 60 FPS

  useEffect(() => {
    if (!selectedObjectUUID || !animClip || paused) {
      return;
    }

    const target = findObjectInTree(selectedObjectUUID, sceneObjects);
    if (!target) {
      toast.error("Target Not Found");
      return;
    }

    if (!animationRef.current) {
      animationRef.current = new AnimationRunner(target);
    }

    if (!animationRef.current.isAnimationEnable()) {
      if (animClip) {
        animationRef.current.setAnimationClip(animClip);
      } else {
        toast.error("Animation Clip Not Found");
        return;
      }
    }

    setMax(animationRef.current.length - 1);
    animationRef.current.isPlaying = !paused;
    animationRef.current.isReverse = reverse;
    // toast.info(`Animation State Max: ${max}, Play: ${true}, Reverse: False`);

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current;

      if (deltaTime >= fpsInterval) {
        lastFrameTimeRef.current = currentTime - (deltaTime % fpsInterval);

        animationRef.current!.update(deltaTime / 1000); // Update animation
        setFrame(animationRef.current!.CurrentFrame);
        updateObjectInState(animationRef.current!.root);

        if (!paused) {
          requestAnimationRef.current = requestAnimationFrame(animate);
        }
      } else {
        requestAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    if (!paused) {
      if (!loop && animationRef.current!.CurrentFrame >= max) {
        setPaused(true);
        animationRef.current!.isPlaying = false;
        cancelAnimationFrame(requestAnimationRef.current!);
      } else {
        requestAnimationRef.current = requestAnimationFrame(animate);
      }
    }

    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [
    paused,
    animClip,
    reverse,
    loop,
    max,
    selectedObjectUUID,
    sceneObjects,
    updateObjectInState,
    findObjectInTree,
    fpsInterval,
  ]);

  useEffect(() => {
    if (selectedObjectUUID && animClip && !paused) {
      const target = findObjectInTree(selectedObjectUUID, sceneObjects);
      if (target) {
        updateObjectInState(target);
      }
    }
  }, [
    frame,
    selectedObjectUUID,
    sceneObjects,
    updateObjectInState,
    findObjectInTree,
    animClip,
    paused,
  ]);

  const handleSliderChange = (value: number | number[]) => {
    if (animationRef.current && typeof value === "number") {
      animationRef.current.setCurrentFrame(value);
      setFrame(value);
    }
  };

  const handleAnimFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInterpolate(false);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const _animation = JSON.parse(e.target?.result as string);
          setAnimClip(_animation as AnimationClip);
          setAnimFileName(file.name);
          if (animationRef.current) {
            animationRef.current.setAnimationClip(_animation);
          } else {
            const target = findObjectInTree(selectedObjectUUID!, sceneObjects);
            if (target) {
              const newAnimationRunner = new AnimationRunner(target);
              newAnimationRunner.setAnimationClip(_animation);
              animationRef.current = newAnimationRunner;
            }
          }
        } catch (error) {
          toast.error("Error Parse " + error);
        }
      };
      reader.readAsText(file);
    } else {
      setAnimClip(null);
      setAnimFileName("");
    }
  };

  const startFrame = () => {
    if (animationRef.current) {
      animationRef.current.start();
      setFrame(0);
      setPaused(true);
      updateObjectInState(animationRef.current.root);
    }
  };

  const prevFrame = () => {
    if (animationRef.current) {
      animationRef.current.prev();
      setFrame(animationRef.current.CurrentFrame);
      setPaused(true);
    }
  };

  const nextFrame = () => {
    if (animationRef.current) {
      animationRef.current.next();
      setFrame(animationRef.current.CurrentFrame);
      setPaused(true);
    }
  };

  const endFrame = () => {
    if (animationRef.current) {
      animationRef.current.end();
      setFrame(animationRef.current.CurrentFrame);
      setPaused(true);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 border-y border-y-zinc-700 p-2 px-3">
      {/* Component Name */}
      <div className="flex items-center gap-2">
        <MdOutlineAnimation className="mb-0.5 size-4 text-stone-100" />
        <p className="text-sm font-medium text-white">Animator</p>
      </div>
      <div className="">
        <input
          type="file"
          ref={animationInputRef}
          className="hidden"
          accept=".json"
          onChange={handleAnimFileChange}
        />
        <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-zinc-800 px-3 py-1">
          <p className="whitespace-nowrap text-sm text-white">
            {animFileName || "No file chosen"}
          </p>
          <button
            className="rounded bg-zinc-700 p-1"
            onClick={() => animationInputRef.current?.click()}
          >
            <MdAttachFile className="text-gray-300" />
          </button>
        </div>
      </div>
      {animFileName !== "" ? (
        <div>
          {/* Play Animation */}
          <div className="flex w-full flex-col">
            {/* Buttons */}
            <div className="my-2 text-sm">
              <div className="flex items-center justify-between px-20">
                <button onClick={startFrame}>
                  <TrackPreviousIcon className="size-4 text-stone-100" />
                </button>
                <button onClick={prevFrame}>
                  <ChevronLeftIcon className="size-4 text-stone-100" />
                </button>
                <button
                  onClick={() => {
                    setPaused(!paused);
                    if (
                      animationRef.current!.CurrentFrame ===
                      animationRef.current!.length - 1
                    ) {
                      if (reverse) {
                        animationRef.current!.setCurrentFrame(max - 1);
                      } else {
                        animationRef.current!.setCurrentFrame(0);
                      }
                    }
                  }}
                  disabled={!animationRef.current?.isAnimationEnable()}
                >
                  {!paused ? (
                    <PauseIcon className="size-4 text-stone-100" />
                  ) : (
                    <PlayIcon className="size-4 text-stone-100" />
                  )}
                </button>
                <button onClick={nextFrame}>
                  <ChevronRightIcon className="size-4 text-stone-100" />
                </button>
                <button onClick={endFrame}>
                  <TrackNextIcon className="size-4 text-stone-100" />
                </button>
              </div>
            </div>
            <Slider
              min={0}
              max={max}
              value={frame}
              onChange={handleSliderChange}
              styles={{
                track: { backgroundColor: "#6B7280" },
                rail: { backgroundColor: "#374151" },
                handle: { backgroundColor: "#D1D5DB" },
              }}
            />
          </div>
          <div className="flex justify-end text-white">
            <h2 className="text-xs">
              {frame} / {max} Frame
            </h2>
          </div>
          <div className="my-2 flex">
            <Checkbox
              className="m-auto mx-0 border-white"
              checked={loop}
              onClick={() => setLoop(!loop)}
            />
            <p className="m-auto ml-2 text-xs text-white">Loop</p>
          </div>
          <div className="my-2 flex">
            <Checkbox
              className="m-auto mx-0 border-white"
              checked={reverse}
              onClick={() => setReverse(!reverse)}
            />
            <p className="m-auto ml-2 text-xs text-white">Reverse</p>
          </div>
          <div>
            <div className="my-2 flex">
              <Checkbox
                className="m-auto mx-0 border-white"
                checked={interpolate}
                onClick={() => {
                  if (interpolate) {
                    animationRef.current!.unsetInterpolation();
                  } else {
                    animationRef.current!.setInterpolation(ease, variant);
                  }
                  setInterpolate(!interpolate);
                }}
              />
              <p className="m-auto ml-2 text-xs text-white">Interpolate</p>
            </div>
            {interpolate && (
              <div className="">
                <div className="mb-3 mt-4 flex w-full items-center gap-4">
                  <p className="text-xs text-stone-100">Ease</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex w-full items-center justify-between rounded-md bg-zinc-700 px-3 py-1 focus:border-none">
                        <p className="text-xs text-stone-100">{ease}</p>
                        <CaretSortIcon className="size-4 text-stone-100" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full border-zinc-900 bg-zinc-800 text-white">
                      {easeType.map((ease, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() => {
                            setEase(ease);
                            animationRef.current!.setInterpolation(
                              ease,
                              variant,
                            );
                          }}
                          className="focus:bg-zinc-700 focus:text-white"
                        >
                          {ease}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {ease !== "linear" && (
                  <div className="flex w-full items-center gap-4">
                    <p className="text-xs text-stone-100">Variant</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full">
                        <div className="flex w-full items-center justify-between rounded-md bg-zinc-700 px-3 py-1 focus:border-none">
                          <p className="text-xs text-stone-100">{variant}</p>
                          <CaretSortIcon className="size-4 text-stone-100" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full border-zinc-900 bg-zinc-800 text-white">
                        {easeVariant.map((variant, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => {
                              setVariant(variant);
                              animationRef.current!.setInterpolation(
                                ease,
                                variant,
                              );
                            }}
                            className="focus:bg-zinc-700 focus:text-white"
                          >
                            {variant}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
