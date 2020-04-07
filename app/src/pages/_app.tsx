
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import 'leaflet/dist/leaflet.css';
import App from 'next/app';
import Head from 'next/head';
import React from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from '../theme';

export default class MyApp extends App {
    componentDidMount() {
    }

    render() {
        const { Component, pageProps } = this.props;

        return (
            <React.Fragment>
                <Head>
                    <title>Fungus Friends</title>
                    <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
                </Head>
                <ThemeProvider theme={theme}>
                    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                    <CssBaseline />
                    <Component {...pageProps} />
                    <ToastContainer
                        className="impct-toast"
                        position="bottom-left"
                        autoClose={3000}
                        hideProgressBar
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        draggable={false}
                        pauseOnHover
                        transition={Slide}
                    />
                </ThemeProvider>
            </React.Fragment>
        );
    }
}