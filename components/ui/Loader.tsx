export function Loader({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center p-12 ${className}`}>
            <div className="loader"></div>
        </div>
    );
}
