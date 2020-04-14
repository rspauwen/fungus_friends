import { Box, Button, Container, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import L from 'leaflet';
import React from 'react';
import { Map, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import { Color, Fungus, Spots } from '../../model/fungus';
import { LatLng } from '../../model/latlng';
import FungusService from '../../services/FungusService';
import theme from '../../theme';
import FungusCard from '../FungusCard/FungusCard';
import FungusDialog from '../FungusDialog/FungusDialog';
import FungusDrawer from '../FungusDrawer/FungusDrawer';
import styles from './FungusMap.module.scss';


function getIconSVG(mapIconColor, mapIconColorInnerCircle, pinInnerCircleRadius) {
    return `<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149 178"><path fill="${mapIconColor}" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M126 23l-6-6A69 69 0 0 0 74 1a69 69 0 0 0-51 22A70 70 0 0 0 1 74c0 21 7 38 22 52l43 47c6 6 11 6 16 0l48-51c12-13 18-29 18-48 0-20-8-37-22-51z"/><circle fill="${mapIconColorInnerCircle}" cx="74" cy="75" r="61"/><circle fill="#FFF" cx="74" cy="75" r="${pinInnerCircleRadius}"/></svg>`;
}

var markerIcon = L.divIcon({
    className: "leaflet-data-marker",
    html: getIconSVG(theme.palette.primary.main, theme.palette.background.default, 48),
    iconSize: [25, 32],
    iconAnchor: [10, 20],
    popupAnchor: [2, 0]
});

var markerIconCustom = L.divIcon({
    className: "leaflet-data-marker",
    html: getIconSVG(theme.palette.secondary.main, theme.palette.background.default, 48),
    iconSize: [25, 32],
    iconAnchor: [10, 20],
    popupAnchor: [2, 0]
});

interface MyProps { }

interface MyState {
    currentLoc: LatLng,
    clickedLoc: LatLng,
    clickedFungus: Fungus,
    fungi: Array<Fungus>,
    markers: Array<Marker>,
    colors: Array<String>,
    spots: Array<String>,
    addEnabled: boolean,
    drawerOpen: boolean,
    showDialog: boolean,
}

export default class FungusMap extends React.Component<MyProps, MyState> {
    state = {
        currentLoc: new LatLng(
            52.081059,
            5.235720),
        clickedLoc: null,
        clickedFungus: null,
        fungi: null,
        markers: null,
        colors: null,
        spots: null,
        addEnabled: false,
        drawerOpen: false,
        showDialog: false,
    }

    private mapRef;
    private drawerRef;
    private markerRefs;

    constructor(props) {
        super(props)
        this.mapRef = React.createRef()
        this.drawerRef = React.createRef()
        this.markerRefs = [];
    }

    async componentDidMount() {
        var colors: string[] = [];
        for (var c in Color) {
            if (typeof Color[c] === 'number') colors.push(c);
        }
        var spots: string[] = [];
        for (var s in Spots) {
            if (typeof Spots[s] === 'number') spots.push(s);
        }

        this.setState({
            drawerOpen: window.innerWidth >= 1440,
            fungi: await FungusService.fetchFungi(),
            colors: colors,
            spots: spots
        }, this.addMarkers);

        document.addEventListener("keydown", (e) => {
            if (e.keyCode === 27 && this.state.addEnabled) {
                this.drawerRef.current.state.addEnabled = false;
                this.setState({ addEnabled: false });
            }
        });

        window.addEventListener('resize', () => {
            this.setState({
                drawerOpen: window.innerWidth >= 1440
            });
        }, false);
    }

    addMarkers = async () => {
        const markers =
            this.state.fungi != null ? this.state.fungi.filter((f: Fungus) => !f.isHidden).map((fungus: Fungus, i) => (
                <Marker
                    key={fungus.id}
                    icon={!fungus.isCustom ? markerIcon : markerIconCustom}
                    position={[fungus.latlng.lat, fungus.latlng.lng]}
                    ref={this.bindMarkerRef.bind(this, i)}
                    onclick={() => {
                        this.onMarkerClick(i);
                    }}
                >
                    <Tooltip>
                        <span>
                            {fungus.name}
                        </span>
                    </Tooltip>
                    <Popup maxWidth="auto">
                        <FungusCard fungus={fungus}
                            editFungusCallback={this.editFungusCallbackFunction}
                            refreshMapCallback={this.refreshMapCallbackFunction} />
                    </Popup>
                </Marker>
            )) : [];

        this.setState({
            markers: markers
        });
    }

    bindMarkerRef = (index, node) => {
        this.markerRefs[index] = node;
    };

    // Quite a collection of callback functions already...

    closeDialogCallbackFunction = () => {
        this.setState({ clickedFungus: null, showDialog: false, addEnabled: false });
    }

    closeDrawerCallbackFunction = () => {
        this.setState({ drawerOpen: false });
    }

    editFungusCallbackFunction = (fungus: Fungus) => {
        this.mapRef.current.leafletElement.closePopup();
        this.setState({ clickedFungus: fungus, showDialog: true });
    }

    enableAddFungusCallbackFunction = (enableAdd: boolean) => {
        if (enableAdd) {
            this.setState({ addEnabled: true });
        } else {
            this.setState({ addEnabled: false, clickedLoc: null });
        }
    }

    refreshMapCallbackFunction = (fungi: Array<Fungus>) => {
        if (fungi == null) {
            FungusService.fetchFungi().then((fetchedFungi) => {
                this.setState({
                    fungi: fetchedFungi
                }, this.addMarkers);
            });
        } else {
            this.setState({ fungi: fungi });
        }
    }

    searchCallbackFunction = (fungus: Fungus) => {
        const index = fungus != null ? this.state.markers.findIndex(f => f.key === fungus.id) : -1;
        const searchedFungi = this.state.fungi;

        searchedFungi[index] = fungus; // ensure it's not hidden;
        this.setState({ fungi: searchedFungi });

        if (index == -1) {
            this.mapRef.current.leafletElement.closePopup();
            return;
        }
        this.onMarkerClick(index);
    }

    onClickOnMap = (e) => {
        if (this.state.addEnabled) {
            const clickedLoc = new LatLng(e.latlng.lat, e.latlng.lng);
            this.setState({ clickedLoc: clickedLoc, showDialog: true });
        }
    };

    onMarkerClick(index) {
        const markerPosition = this.state.markers[index].props.position;
        const popupOffset = 0.001;

        if (this.markerRefs[index]) {
            this.markerRefs[index].leafletElement.openPopup();
        }

        this.setState({ currentLoc: new LatLng(markerPosition[0] + popupOffset, markerPosition[1]) });
    }

    render() {
        const fungi = this.state.fungi ?? [];

        const fungusDialog = this.state.showDialog ?
            <FungusDialog
                mapState={this.state}
                closeDialogCallback={this.closeDialogCallbackFunction}
                refreshMapCallback={this.refreshMapCallbackFunction} />
            : null

        const menuButton = this.drawerRef.current != null && window.innerWidth < 1440 ?
            <Button onClick={() => { this.setState({ drawerOpen: true, addEnabled: false }); }}>
                <MenuIcon />
            </Button> : null;

        return (
            <Container maxWidth="lg">
                <Box my={4} className={styles.fungus_map_header}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {`Welcome to ${window.innerWidth >= 800 ? "Ruvar's" : ""} fungus finder!`}
                    </Typography>
                    {menuButton}
                </Box>
                <Map
                    className={`${styles.fungus_map} ${this.state.addEnabled ? styles.add_enabled : ""}`}
                    center={this.state.currentLoc}
                    length={4}
                    ref={this.mapRef}
                    setView={true}
                    zoom={17}
                    onClick={this.onClickOnMap}
                >
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {fungi.map((f: Fungus, i) => { return !f.isHidden && this.state.markers != null ? this.state.markers[i] ?? null : null })}
                </Map>

                <FungusDrawer
                    mapState={this.state}
                    closeDrawerCallback={this.closeDrawerCallbackFunction}
                    enableAddFungusCallback={this.enableAddFungusCallbackFunction}
                    refreshMapCallback={this.refreshMapCallbackFunction}
                    searchCallBack={this.searchCallbackFunction}
                    ref={this.drawerRef}
                />

                {fungusDialog}
            </Container >
        );
    }
}