import L from 'leaflet';
import React from 'react';
import { Map, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { Fungus } from '../../typings/fungus';
import { LatLng } from '../../typings/latlng';
import styles from './FungusMap.module.scss';


const API = 'https://fungus-friends.firebaseapp.com/api/v1/';
const FUNGI_ENDPOINT = 'fungi';

var iconSettings = {
    mapIconUrl: '<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149 178"><path fill="{mapIconColor}" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M126 23l-6-6A69 69 0 0 0 74 1a69 69 0 0 0-51 22A70 70 0 0 0 1 74c0 21 7 38 22 52l43 47c6 6 11 6 16 0l48-51c12-13 18-29 18-48 0-20-8-37-22-51z"/><circle fill="{mapIconColorInnerCircle}" cx="74" cy="75" r="61"/><circle fill="#FFF" cx="74" cy="75" r="{pinInnerCircleRadius}"/></svg>',
    mapIconColor: '#cc756b',
    mapIconColorInnerCircle: '#fff',
    pinInnerCircleRadius: 48
};

var markerIcon = L.divIcon({
    className: "leaflet-data-marker",
    html: L.Util.template(iconSettings.mapIconUrl, iconSettings),
    iconAnchor: [12, 32],
    iconSize: [25, 30],
    popupAnchor: [0, -28]
});

var markerIconActive = L.divIcon({
    className: "leaflet-data-marker",
    html: L.Util.template(iconSettings.mapIconUrl, iconSettings),
    iconAnchor: [18, 42],
    iconSize: [36, 42],
    popupAnchor: [0, -30]
});

export default class FungusMap extends React.Component {
    state = {
        fungi: null,
        currentLoc: new LatLng(
            52.080959,
            5.235020)
    }

    markers = {
        set: null,
    }

    private mapRef;

    constructor(props) {
        super(props)
        this.mapRef = React.createRef()
    }

    componentDidMount() {
        // this.mapRef.current.leafletElement.locate({
        //     setView: true
        // });

        if (this.state.fungi == null) {
            fetch(API + FUNGI_ENDPOINT)
                .then(response => response.json())
                .then(data => {
                    // console.log('response data:', data);
                    this.setState({
                        fungi: Object.keys(data.fungi).map((f) => {
                            return new Fungus(
                                data.fungi[f].name,
                                data.fungi[f].spots,
                                data.fungi[f].color,
                                data.fungi[f].latlng,
                            );
                        })
                    });
                    // console.log(this.state);
                })
                .catch(e => {
                    console.log(e);
                    return e;
                });
        }

    }

    handleClick = () => {
        this.mapRef.current.leafletElement.locate();
    };

    handleLocationFound = currentLoc => {
        console.log('currentLoc:', currentLoc);
        this.setState({
            hasLocation: true,
            latlng: currentLoc.latlng
        });
    };


    render() {
        let fetchedFungi = this.state.fungi;

        const markers = fetchedFungi == null ? null :

            this.state.fungi.map((fungus: Fungus, i) => {

                var latlng = [fungus.latlng.lat, fungus.latlng.lng];

                return (
                    <Marker
                        key={fungus.name}
                        icon={markerIcon}
                        position={latlng}
                        onClick={() => {
                            console.log(`clicked on: ${latlng}`, this.state);
                            L.marker(fungus.latlng, {
                                icon: markerIconActive
                            });
                        }}

                    >
                        <Tooltip>
                            <span>
                                {fungus.name}
                            </span>
                        </Tooltip>
                    </Marker>
                )
            })

        return (
            <Map
                className={styles.fungus_map}
                center={this.state.currentLoc}
                length={4}
                onClick={this.handleClick}
                setView={true}
                onLocationfound={this.handleLocationFound}
                ref={this.mapRef}
                zoom={17}
            >
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers}
            </Map>
        );
    }
}