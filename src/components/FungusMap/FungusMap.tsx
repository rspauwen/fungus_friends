import { Box, Button, Container, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import L from 'leaflet';
import React from 'react';
import { Map, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import { Fungus } from '../../model/fungus';
import { LatLng } from '../../model/latlng';
import theme from '../../theme';
import FungusCard from '../FungusCard/FungusCard';
import FungusDrawer from '../FungusDrawer/FungusDrawer';
import styles from './FungusMap.module.scss';
import FungusService from '../../services/FungusService';


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
    fungi: Array<Fungus>,
    markers: Array<Marker>,
    addEnabled: boolean
}

export default class FungusMap extends React.Component<MyProps, MyState> {
    state = {
        currentLoc: new LatLng(
            52.081059,
            5.235720),
        clickedLoc: null,
        fungi: null,
        markers: null,
        addEnabled: false,
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
        if (this.state.fungi == null) {
            this.setState({
                fungi: await FungusService.fetchFungi()
            }, this.addMarkers);
        }

        document.addEventListener("keydown", (e) => {
            if (e.keyCode === 27 && this.state.addEnabled) {
                this.drawerRef.current.state.addEnabled = false;
                this.setState({ addEnabled: false });
            }
        });
    }

    addMarkers = async () => {
        const markers =
            this.state.fungi != null ? this.state.fungi.filter((f: Fungus) => !f.isHidden).map((fungus: Fungus, i) => (
                <Marker
                    key={fungus.id}
                    icon={!fungus.isCustom ? markerIcon : markerIconCustom}
                    position={[fungus.latlng.lat, fungus.latlng.lng]}
                    ref={this.handleMarkerRef.bind(this, i)}
                    onclick={() => {
                        this.markerClick(i);
                    }}
                >
                    <Tooltip>
                        <span>
                            {fungus.name}
                        </span>
                    </Tooltip>
                    <Popup maxWidth="auto">
                        <FungusCard fungus={fungus} refreshMapCallback={this.refreshMapCallbackFunction} />
                    </Popup>
                </Marker>
            )) : [];

        this.setState({
            markers: markers
        });
    }

    addFungusCallbackFunction = (enableAdd: boolean) => {
        if (enableAdd) {
            this.setState({ addEnabled: true });
        } else {
            this.setState({ addEnabled: false, clickedLoc: null });
        }
    }

    filterCallbackFunction = (filteredFungi: Array<Fungus>) => {
        this.setState({ fungi: filteredFungi })
    }

    refreshMapCallbackFunction = () => {
        FungusService.fetchFungi().then((fetchedFungi) => {
            this.setState({
                fungi: fetchedFungi
            }, this.addMarkers);
        });
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
        this.markerClick(index);
    }

    handleClickOnMap = (e) => {
        if (this.state.addEnabled) {
            const clickedLoc = new LatLng(e.latlng.lat, e.latlng.lng);
            this.setState({ clickedLoc: clickedLoc });
        }
    };

    markerClick(index) {
        const markerPosition = this.state.markers[index].props.position;
        const cardOffset = 0.005;

        this.setState(
            {
                currentLoc: new LatLng(markerPosition[0] + cardOffset, markerPosition[1]),
            },
            () => {
                if (this.markerRefs[index]) {
                    this.markerRefs[index].leafletElement.openPopup();
                }
            }
        );
    }

    handleMarkerRef = (index, node) => {
        this.markerRefs[index] = node;
    };

    render() {
        const fungi = this.state.fungi ?? [];

        const menuButton = this.drawerRef.current == null || this.drawerRef.current.state.open ? null :
            <Button onClick={() => { this.drawerRef.current.openDrawer() }}>
                <MenuIcon />
            </Button>

        return (
            <Container maxWidth="lg">
                <Box my={4} style={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome to Ruvar's Fungus Friends Finder!
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
                    onClick={this.handleClickOnMap}
                >
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* {fungi.filter((f: Fungus) => !f.isHidden).map((fungus: Fungus, i) => ( */}
                    {fungi.map((f: Fungus, i) => { return !f.isHidden && this.state.markers != null ? this.state.markers[i] ?? null : null })}

                </Map>
                <FungusDrawer fungi={fungi}
                    clickedLoc={this.state.clickedLoc}
                    addFungusCallBack={this.addFungusCallbackFunction}
                    filterCallback={this.filterCallbackFunction}
                    refreshMapCallback={this.refreshMapCallbackFunction}
                    searchCallBack={this.searchCallbackFunction}
                    ref={this.drawerRef} />
            </Container>
        );
    }
}