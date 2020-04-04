import dynamic from 'next/dynamic';
import React from 'react';


const FungusMapComponent = dynamic(() => import('../components/FungusMap/FungusMap'), {
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      Busy loading...
    </div>
  )
})


export default function Index() {
  return (
    <FungusMapComponent />
  );
}