import React from 'react';

import { fungusMarkerStyle, fungusMarkerStyleHover } from './fungi_with_hover_styles.js';

export default class MyGreatPlaceWithHover extends React.PureComponent {

  render() {
    const style = this.props.$hover ? fungusMarkerStyleHover : fungusMarkerStyle;

    return (
      <div
        // @ts-ignore
        style={style}>
        {this.props.text}
      </div>
    );
  }
}
