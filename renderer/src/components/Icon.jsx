import React from "react";

export default function Icon({ icon, className = "", ...props }) {
    // React не поддерживает атрибут class, поэтому используем className → class
    return (
        <svg-inline
            {...props}
            className={`inline-svg ${className}`}
            src={`/icons/${icon}.svg`}
        ></svg-inline>
    );
}
