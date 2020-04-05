import { Button, Card, CardActionArea, CardActions, CardContent, IconButton, Typography } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/SearchRounded';
import React from 'react';
import Unsplash, { toJson } from 'unsplash-js';
import { Fungus } from '../../model/fungus';
import styles from './FungusCard.module.scss';

export default class FungusCard extends React.Component<{ fungus: Fungus }> {

    state = {
        fungus: this.props.fungus,
        cardImageUrls: null,
    };


    async componentDidMount() {
        const unsplash = new Unsplash({
            accessKey: '' // check mail;
        });

        await unsplash.photos.getRandomPhoto({ query: "fungus" })
            .then(toJson)
            .then(json => {
                this.setState({
                    cardImageUrls: json.urls
                });
            }).catch(e => {
                console.log(e);
                return e;
            });
    }

    render() {
        const fungus = this.state.fungus;

        const cardImage = this.state.cardImageUrls == null ? null :
            <div className={styles.fungus_card_image}><img src={this.state.cardImageUrls.small} alt="random fungus image" /></div>

        const searchUrl = `https://www.google.com/search?q=fungus+%22${this.state.fungus.name.replace(' ', '+')}%22`;

        const customFungusLabel = fungus.isCustom ?
            <Typography variant="body1" color="textSecondary" component="p">
                This Fungus is added by you!
            </Typography> : null;

        // TODO: implement delete custom fungus functionality
        // const removeCustomFungusButton = fungus.isCustom ?
        //     <Button disabled size="small" color="secondary">
        //         Remove
        //     </Button> : null;

        return (
            <Card className={styles.fungus_card} elevation={0} key={`fungus_card_${fungus.name}`}>
                <CardActionArea>
                    {cardImage}    {/* TODO: show large image when you click on it */}
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {fungus.name}
                        </Typography>
                        <Typography variant="body1" color="textSecondary" component="p">
                            Spots: {fungus.spots}<br />
                        Color: {fungus.color.toString().toLowerCase()}
                        </Typography>
                        {customFungusLabel}
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <a href={searchUrl} target="_blank">
                        <IconButton aria-label="google" color="primary">
                            <SearchIcon />
                        </IconButton>
                    </a>
                    {/* {removeCustomFungusButton} */}
                </CardActions>
            </Card>
        );
    }
}

