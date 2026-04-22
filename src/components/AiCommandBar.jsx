import { set } from "date-fns";
import { useRef, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { validateAICommand } from "../validations/aiCommandValidator.js";
import { useEffect } from "react";

const AICommandBar = ({
    onExecute,
    placeholder = "Type a command...",
    onSuccess,
    onError,
    autoClear = true,
    resetTrigger,//  NEW
    disabled = false // NEW

}) => {
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fileRef = useRef(null);
    const isDisabled = loading || disabled;

    useEffect(() => {
        if (resetTrigger) {
            setText("");
            setFile(null);
            if (fileRef.current) fileRef.current.value = "";
        }
    }, [resetTrigger]);


    const sendCommand = async () => {
        if (loading) return;

        const validationError = validateAICommand({ message: text, file });
        if (validationError) {
            setError(validationError);
            return;
        }


        try {
            setLoading(true);
            setError("");

            const payload = {
                message: text,
                file: file
            };

            const res = await onExecute(payload);

            if (res?.success) {
                if (autoClear) {
                    setText("");
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                }
                onSuccess?.(res);
            } else (err) => {
                setError(err.message || "Something went wrong");
                onError?.(res);
            }

        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Server error");
            onError?.(err);
        } finally {
            setLoading(false);
        }




    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            if (loading || disabled) return;

            // CASE 1: FILE EXISTS → ALWAYS PROCESS FILE
            if (file) {
                sendCommand();
                return;
            }

            // CASE 2: TEXT EXISTS → COMMAND FLOW
            if (text.trim()) {
                sendCommand();
            }
        }
    };


    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setError("");
    };

    const removeFile = () => {
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    return (
        <div className="w-full max-w-xl flex flex-col gap-2">

            {/* hidden file input */}
            <input
                type="file"
                ref={fileRef}
                className="hidden"
                accept=".csv,.xml,.pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
            />

            {/* INPUT BOX */}
            <div className={`flex-1 flex items-center gap-1 border rounded bg-white
                ${error ? 'border-red-400' : 'border-gray-300'}
                focus-within:ring-1 focus-within:ring-indigo-300`} >

                {/* + icon */}
                <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="px-2 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                    disabled={isDisabled}
                >
                    <FaPlus size={10} />
                </button>

                {/* text input */}
                <input
                    className="flex-1 p-2 text-sm bg-transparent outline-none"
                    placeholder={placeholder}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setError("");
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                />

                {/* file chip */}
                {file && (
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs mr-1">
                        <span className="max-w-[120px] truncate">
                            {file.name}
                        </span>
                        <button
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700"
                        >
                            <FaTimes size={12} />
                        </button>
                    </div>
                )}

                {/* loader */}
                {loading && (
                    <div className="mr-2">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* 🔥 ERROR MESSAGE */}
            {error && (
                <p className="text-red-500 text-xs mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default AICommandBar;