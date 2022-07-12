import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {createGlobalStyle} from "styled-components";

import {NewApp} from "./New.tsx";
import {globalStyle} from "./styles.ts";

const GlobalStyle = createGlobalStyle`
  ${globalStyle}
`;
declare global {
    interface Window {
        blockies: any;
        connector: any;
    }
}

const rootDiv = document.getElementById("root")!;
const root = createRoot(rootDiv);

root.render(
    <>
        <GlobalStyle/>
        <NewApp/>
    </>,
);
