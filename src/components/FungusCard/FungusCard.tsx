import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Typography, Link } from '@material-ui/core';
import { Fungus } from '../../model/fungus';
import styles from './FungusCard.module.scss';
import React from 'react';
import Unsplash from 'react-unsplash-wrapper'

export default function FungusCard(fungus: Fungus) {

    const learnMoreUrl = `https://www.google.com/search?q=fungus+%22${fungus.name.replace(' ', '+')}%22`;



    return (
        <div>


            <Card className={styles.fungus_card}>
                <CardActionArea>

                    <Unsplash height="100" width="300" keywords="fungus" img />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {fungus.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            Spots: {fungus.spots}<br />
                        Color: {fungus.color.toString().toLowerCase()}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <a href={learnMoreUrl} target="_blank">
                        <Button size="small" color="primary">
                            Learn More
                </Button>
                    </a>
                </CardActions>
            </Card>
        </div>
    );
}

