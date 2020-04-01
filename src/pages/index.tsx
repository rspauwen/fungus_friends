import { Container, SvgIcon, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import dynamic from 'next/dynamic';
import React from 'react';


const FungusMapComponent = dynamic(() => import('../components/fungus-map'), {
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      Busy loading...
    </div>
  )
})

// function HomeIcon(props) {
//   return (
//     <SvgIcon {...props}>
//       <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
//     </SvgIcon>
//   );
// }

export default function Index() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Welcome to Fungus Friends!
        </Typography>

      </Box>
      <FungusMapComponent />
    </Container>
  );
}