import { Button, Card, CardActionArea, CardActions, CardContent, Typography } from '@material-ui/core';
import React from 'react';
import Unsplash from 'react-unsplash-wrapper';
import { Fungus } from '../../model/fungus';
import styles from './FungusCard.module.scss';

export default function FungusCard(fungus: Fungus) {

    const searchUrl = `https://www.google.com/search?q=fungus+%22${fungus.name.replace(' ', '+')}%22`;

    return (
        <Card className={styles.fungus_card} elevation={0}>
            <CardActionArea>
                {/* <Unsplash height="150" width="300" keywords="fungus" img /> */}
                <div className={styles.fungus_card_image}>
                    <Unsplash expand keywords="fungus" />
                </div>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {fungus.name}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" component="p">
                        Spots: {fungus.spots}<br />
                        Color: {fungus.color.toString().toLowerCase()}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <a href={searchUrl} target="_blank">
                    <Button size="small" color="primary">
                        Learn More
                    </Button>
                </a>
                {/* <Button size="small" color="secondary">
                    Remove
                </Button> */}
            </CardActions>
        </Card>
    );
}

