import { useEffect } from "react"

function Menu({
    open,
    onClose,
    children,
    className = ""
}) {
    useEffect(() => {
        document.body.style.overflow =
            open ? "hidden" : ""

        return () => {
            document.body.style.overflow = ""
        }
    }, [open])

    if (!open) return null

    return (
        <div className="
            fixed inset-0
        ">
            <div
                onClick={onClose}
                className="
                    w-screen
                    z-50
                    absolute inset-0
                    bg-black/50
                    animate-in fade-in
                    duration-300
                "
            />

            <div
                className={`
                    absolute
                    bottom-4
                    w-85
                    z-100
                    rounded-4xl
                    border border-white/10
                    bg-[#111115]/95
                    backdrop-blur-3xl
                    p-6
                    shadow-2xl
                    shadow-black/50
                    animate-in
                    fade-in
                    zoom-in-95
                    slide-in-from-bottom-2
                    duration-300
                    ${className}
                `}
            >
                {children}
            </div>
        </div>
    )
}

export default Menu