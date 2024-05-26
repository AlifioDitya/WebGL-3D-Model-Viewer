import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useRef, useState } from "react";
import { MdAttachFile } from "react-icons/md";
import { toast } from "react-toastify";

interface ImportObjectDialogProps {
  onSubmit: (gltfFile: File, binFile: File) => void;
}

export default function ImportObjectDialog({
  onSubmit,
}: ImportObjectDialogProps): JSX.Element {
  const [gltfFile, setGltfFile] = useState<File | null>(null);
  const [binFile, setBinFile] = useState<File | null>(null);
  const [gltfFileName, setGltfFileName] = useState<string>("");
  const [binFileName, setBinFileName] = useState<string>("");

  const gltfInputRef = useRef<HTMLInputElement | null>(null);
  const binInputRef = useRef<HTMLInputElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const handleGltfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setGltfFile(file);
      setGltfFileName(file.name);
    } else {
      setGltfFile(null);
      setGltfFileName("");
    }
  };

  const handleBinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setBinFile(file);
      setBinFileName(file.name);
    } else {
      setBinFile(null);
      setBinFileName("");
    }
  };

  const handleSubmit = () => {
    if (gltfFile && binFile) {
      onSubmit(gltfFile, binFile);
      closeRef.current?.click();
    } else {
      toast.error("Please select both .gltf and .bin files.");
    }
  };

  return (
    <DialogContent className="border-zinc-900 bg-zinc-900/90 text-white sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Import Object</DialogTitle>
        <DialogDescription className="text-zinc-300">
          Make sure to provide both .gltf and .bin files.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3 py-4">
        <div className="flex items-center gap-4 px-3">
          <label htmlFor="gltf-file" className="font-mono">
            .gltf
          </label>
          <input
            type="file"
            ref={gltfInputRef}
            className="hidden"
            accept=".gltf"
            onChange={handleGltfFileChange}
          />
          <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-zinc-800 px-3 py-2">
            <p className="whitespace-nowrap text-white">
              {gltfFileName || "No file chosen"}
            </p>
            <button
              className="rounded bg-zinc-700 p-1"
              onClick={() => gltfInputRef.current?.click()}
            >
              <MdAttachFile />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6 px-3">
          <label htmlFor="bin-file" className="font-mono">
            .bin
          </label>
          <input
            type="file"
            ref={binInputRef}
            className="hidden"
            accept=".bin"
            onChange={handleBinFileChange}
          />
          <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-zinc-800 px-3 py-2">
            <p className="whitespace-nowrap text-white">
              {binFileName || "No file chosen"}
            </p>
            <button
              className="rounded bg-zinc-700 p-1"
              onClick={() => binInputRef.current?.click()}
            >
              <MdAttachFile />
            </button>
          </div>
        </div>
      </div>
      <DialogFooter>
        <button
          type="submit"
          className="rounded-lg bg-zinc-800 px-4 py-1.5 hover:bg-zinc-700 focus:outline-none"
          onClick={handleSubmit}
          disabled={!gltfFile || !binFile}
        >
          Add Object
        </button>
        <DialogClose className="hidden" id="close-dialog" ref={closeRef} />
      </DialogFooter>
    </DialogContent>
  );
}
