import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {Buffer} from "buffer";
import {WalletApp} from "./WalletApp.tsx";

declare global {
    interface Window {
        blockies: any;
        connector: any;
    }
}

window.Buffer = Buffer;

const rootDiv = document.getElementById("root");
if(!rootDiv){
    throw new Error("root undefind")
}
const root = createRoot(rootDiv);

root.render(
    <>
        <WalletApp/>
    </>,
);
