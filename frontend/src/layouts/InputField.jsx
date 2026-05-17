import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"

function InputField({
    name,
    type = "text",
    value,
    onChange,
    label,
    placeholder,
    alert = false,
    autoComplete = false,
    disabled = false,
    width = "w-full",
    ...rest
}) {
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === "password"
    const isPhone = type === "phone"
    const isCP = type === "cp"
    const isTA = type === "textarea"
    const isNumber = type === "number"
    const isFile = type === "file"

    const isDateType = ["date", "time", "datetime-local", "month", "week"].includes(type)

    const showLabel = !!label

    let inputType = type
    if (isPassword) inputType = showPassword ? "text" : "password"
    if (isPhone) inputType = "tel"
    if (isCP) inputType = "text"

    const alertStyles = alert
        ? "focus:ring-2 focus:ring-yellow-400 border-yellow-400"
        : "focus:ring-2 focus:ring-violet-500 focus:border-violet-500"

    const handleChange = (e) => {
        let newValue = e.target.value

        if (isFile) {
            newValue = e.target.files[0] || null
        }

        if (isPhone) {
            if (!newValue || newValue === "+52" || newValue === "+52 ") {
                newValue = ""
            } else {
                let rawValue = newValue.startsWith("+52")
                    ? newValue.substring(3)
                    : newValue

                const digits = rawValue.replace(/\D/g, "").slice(0, 10)

                if (digits.length > 0) {
                    newValue = "+52 "
                    if (digits.length <= 3) {
                        newValue += digits
                    } else if (digits.length <= 6) {
                        newValue += `${digits.slice(0, 3)} ${digits.slice(3)}`
                    } else {
                        newValue += `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
                    }
                } else {
                    newValue = ""
                }
            }
        }

        if (isCP) {
            const digits = newValue.replace(/\D/g, "").slice(0, 5)
            newValue = digits
        }

        if (isNumber) {
            newValue = newValue === "" ? "" : Number(newValue)
        }

        if (onChange) {
            onChange({
                ...e,
                target: {
                    ...e.target,
                    name,
                    value: newValue
                }
            })
        }
    }

    const finalPlaceholder = placeholder || " "

    return (
        <div className="relative">
            {isFile ? (
                <>
                    <input
                        {...rest}
                        id={`file-input-${name}`}
                        name={name}
                        type="file"
                        onChange={handleChange}
                        disabled={disabled}
                        className="hidden"
                    />
                    <label
                        htmlFor={`file-input-${name}`}
                        className={`flex items-center w-full px-3 pt-[1.35rem] pb-1.5 bg-transparent border rounded-lg
                        text-white overflow-hidden cursor-pointer
                        focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500 transition disabled:opacity-50
                        ${alert ? "border-yellow-400" : "border-neutral-600"}
                        ${alertStyles}`}
                    >
                        <div className="bg-violet-700 hover:bg-violet-800 text-zinc-200 text-sm font-medium px-3 py-1 rounded transition-colors">
                            Buscar
                        </div>

                        <span className="ml-3 text-sm text-violet-400 truncate flex-1">
                            {value?.name || "Ningún archivo seleccionado."}
                        </span>
                    </label>
                </>
            ) : isTA ? (
                <textarea
                    {...rest}
                    name={name}
                    value={value ?? ""}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder={finalPlaceholder}
                    autoComplete={autoComplete ? name : "off"}
                    rows={4}
                    className={`peer w-full px-3 ${showLabel ? "pt-6 pb-2" : "py-3"} bg-transparent border rounded-lg
                    text-white ${placeholder ? "placeholder-neutral-500" : "placeholder-transparent"} resize-none
                    selection:bg-violet-500/70 selection:text-white
                    focus:outline-none transition disabled:opacity-50
                    ${alert ? "border-yellow-400" : "border-neutral-600"}
                    ${alertStyles}`}
                />
            ) : (
                <input
                    {...rest}
                    name={name}
                    type={inputType}
                    {...(isNumber && rest.min === undefined ? { min: 0 } : {})}
                    value={value ?? ""}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder={finalPlaceholder}
                    autoComplete={autoComplete ? name : "new-password"}
                    className={`peer ${width} bg-transparent border rounded-lg text-white
                    selection:bg-violet-500/70 selection:text-white
                    focus:outline-none transition disabled:opacity-50
                    ${showLabel ? "px-3 pr-10 pt-6 pb-2" : "px-4 py-2.5"} 
                    ${placeholder ? "placeholder-neutral-500 focus:placeholder-neutral-400" : "placeholder-transparent"}
                    ${alert ? "border-yellow-400" : "border-neutral-600"}
                    ${alertStyles}

                    ${isNumber ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : ""}

                    [&::-ms-reveal]:hidden
                    [&::-ms-clear]:hidden
                    [&::-webkit-credentials-auto-fill-button]:hidden
                    [&::-webkit-textfield-decoration-container]:hidden`}
                />
            )}

            {showLabel && (
                <label
                    className={`pointer-events-none absolute left-3 transition-all
                    ${isFile || isDateType
                            ? "top-1 text-xs"
                            : "top-1 text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs"
                        }
                    ${alert ? "text-yellow-400 peer-focus:text-yellow-400" : "text-neutral-400 peer-focus:text-violet-500"}`}
                >
                    {label}
                </label>
            )}

            {!isTA && !isFile && isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition"
                >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
            )}
        </div>
    )
}

export default InputField