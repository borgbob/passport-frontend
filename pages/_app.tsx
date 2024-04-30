import "@/styles/globals.css";
import { Web3Provider } from "@/providers/web3-provider";
import type { AppProps } from "next/app";
import { NextPage } from "next";
import React, { FC, ReactNode } from "react";
import Link from "next/link";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <Component {...pageProps} />
    </Web3Provider>
  );
}


