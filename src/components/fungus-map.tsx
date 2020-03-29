import L from 'leaflet';

import React from 'react';
import { Map, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import styles from './FungusMap.module.scss';
import { Mushroom } from './../mushroom';

const API = 'https://fungus-friends.firebaseapp.com/api/v1/';
const FUNGI_ENDPOINT = 'fungi';

var markerIcon = L.icon({
    iconUrl: 'marker-icon.png',
    shadowUrl: 'marker-shadow.png',
    // iconSize: [38, 95], // size of the icon
    // shadowSize: [50, 64], // size of the shadow
    // iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    // popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});


interface State {
    fungi: Array<Mushroom>,
    latlng: {},
}

export default class FungusMap extends React.Component {
    state = {
        fungi: null,
        latlng: {
            lat: 52.080959,
            lng: 5.235020
        },
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
                        fungi: Object.keys(data.fungi).map((f) => ({
                            name: data.fungi[f].name,
                            spots: data.fungi[f].spots,
                            color: data.fungi[f].color,
                            latlng: data.fungi[f].latlng,
                        }))
                    });
                    console.log(this.state);
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

            this.state.fungi.map((fungus, i) => {
                const { _latitude, _longitude } = fungus.latlng
                return (
                    <Marker
                        key={fungus.name}
                        icon={markerIcon}
                        position={[_latitude, _longitude]}
                        onClick={() => { }}
                    // ref={node => {
                    //     if (!node) return
                    //     this.markers.set(node.leafletElement, fungus.id)
                    // }}
                    >
                        <Tooltip>
                            <span>
                                {fungus.name}
                            </span>
                        </Tooltip>
                    </Marker>
                )
            })
        // const markers = this.state.hasLocations ? (
        //     <Marker icon={markerIcon} position={this.state.latlng}>
        //         <Popup>
        //             <span>You are here</span>
        //         </Popup>
        //     </Marker>
        // ) : null;

        return (
            <Map
                className={styles.fungus_map}
                center={this.state.latlng}
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