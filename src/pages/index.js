import React, { Component } from 'react';
import Head from 'next/head'
import GoogleMapReact from 'google-map-react';


import { GMAPS_API_KEY } from '../../config';

import FungiWithHover from '../../components/fungi_with_hover';
import { K_SIZE } from '../../components/fungi_with_hover_styles';

const mapCenter = { lat: 52.0809626, lng: 5.2328291 };


const markers = (locations, handler) => {
  return locations.map(location => (
    <FungiWithHover
      text={location.id}
      lat={location.lat}
      lng={location.lng}
    />
  ))
}

const locations = [
  { "id": "nervous bell", "lat": 52.082042, "lng": 5.236192 },
  { "id": "nice benz", "lat": 52.080678, "lng": 5.236457 },
  { "id": "quizzical chaplygin", "lat": 52.081624, "lng": 5.235895 },
]


class FungusFriendsMap extends Component {
  static defaultProps = {
    center: mapCenter,
    zoom: 17
  };

  render() {
    return (
      <div>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <link rel="shortcut icon" type="image/x-icon" href="./favicon.ico" />
          <title>fungus friends</title>
        </Head>
        <div style={{ height: '100vh', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: GMAPS_API_KEY }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
            hoverDistance={K_SIZE / 2}
          >
            {markers(locations)}
          </GoogleMapReact>
          <style jsx global>{`
					body { 
						margin: 0;
					}
				`}</style>
        </div>
      </div>
    );
  }
}

export default FungusFriendsMap;
