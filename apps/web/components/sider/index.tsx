'use client';

import { ThemedSiderV2 } from "@refinedev/antd";

const CustomSider = (props: any) => {
    return (
        <ThemedSiderV2
            {...props} // Pass down any additional props
            Title={({ collapsed }) => (
                <img
                    src="/assets/logo.png"
                    alt="Logo"
                    style={{
                        // width: collapsed ? 36 : 120, // Adjust width based on collapse state
                        height: 36,
                        objectFit: "cover",
                        // borderRadius: "50%",
                        transition: "width 0.2s ease",
                    }}
                />
            )}
        />
    );
};

export default CustomSider;