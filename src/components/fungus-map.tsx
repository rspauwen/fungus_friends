import L from 'leaflet';
import React from 'react';
import { Map, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { Fungus } from '../model/fungus';
import { LatLng } from '../model/latlng';
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

interface MyProps { }

interface MyState {
    currentLoc: LatLng,
    hasLocation: boolean,
    fungi: Array<Fungus>,
}

export default class FungusMap extends React.Component<MyProps, MyState> {
    state = {
        currentLoc: new LatLng(
            52.081059,
            5.235720),
        hasLocation: true,
        fungi: null,
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

                    if (Object.keys(data.fungi).length > 0) {
                        const fetchedFungi = Object.keys(data.fungi).map((f) => {
                            return new Fungus(
                                data.fungi[f].name,
                                data.fungi[f].spots,
                                data.fungi[f].color,
                                data.fungi[f].latlng,
                            );
                        })

                        this.setState({
                            fungi: fetchedFungi
                        });

                        // this.setState(prevState => {
                        //     const markerData = [...prevState];
                        //     fungiMarkers[i].isSelected = true;
                        //     return { markerData: markerData };
                        // });
                    }
                })
                .catch(e => {
                    console.log(e);
                    return e;
                });
        }

    }

    // handleClick = () => {
    //     this.mapRef.current.leafletElement.locate();
    // };

    // handleLocationFound = loc => {
    //     console.log('currentLoc:', loc);
    //     this.setState({
    //         hasLocation: true,
    //         currentLoc: new LatLng(loc.latitude, loc.longitude),
    //     });
    // };


    render() {
        const fungi = this.state.fungi ?? [];
        // console.log(this.state.fungi)
        return (
            < div >
                {/* {fungi !== null && fungi.length > 0 ? (
                    'Loaded') : ('Loading...')
                } */}
                <Map
                    className={styles.fungus_map}
                    center={this.state.currentLoc}
                    length={4}
                    ref={this.mapRef}
                    setView={true}
                    zoom={17}
                // onClick={this.handleClick}
                // onLocationfound={this.handleLocationFound}
                >
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {fungi.map((fungus, i) => (

                        <Marker
                            key={fungus.name}
                            icon={fungus.isSelected ? markerIconActive : markerIcon}
                            position={[fungus.latlng.lat, fungus.latlng.lng]}
                            onClick={() => {
                                this.state.fungi.forEach((fungus, index) => fungus.isSelected = index == i);

                                this.setState(() => {
                                    return this.state;
                                });

                                // console.log(`clicked on: '${fungus.name}'`, this.state.fungi);
                            }}

                        >
                            <Tooltip>
                                <span>
                                    {fungus.name}
                                </span>
                            </Tooltip>
                        </Marker>
                    ))}
                </Map>
            </div >
        );
    }
}