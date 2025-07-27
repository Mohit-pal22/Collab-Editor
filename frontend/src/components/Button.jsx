function Button({name, type, className, onClick, children}) {
    return (
        <div className="flex justify-center">
            <button type={type || "submit"} 
                onClick={onClick || undefined}
                className={`p-1 rounded-lg ${className}`}
            >{name}
            </button>
            {children}
        </div>
    )
}
    
export default Button